import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type {
  FriendshipsRow,
  NotificationsInsert,
  PostInsert,
  PostRow,
} from "@/types/db.generated";

type SharePostBody = {
  sharedPostId?: unknown;
  postId?: unknown;
  shareText?: unknown;
  text?: unknown;
};

type SharePostPayload = {
  sharedPostId: string;
  shareText: string;
};

type FriendshipPair = Pick<FriendshipsRow, "user_a" | "user_b">;
type TargetPostIdentityRow = Pick<PostRow, "id" | "authorId">;
type CreatedSharePostRow = Pick<
  PostRow,
  "id" | "authorId" | "content" | "extraContent" | "mediaUrl" | "postType" | "created_at"
>;

const SHARE_NOTIFICATION_KIND_QUERY_PARAM = "notifKind";
const SHARE_NOTIFICATION_KIND_VALUE = "postShared";

function parseBody(body: unknown): SharePostPayload | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as SharePostBody;
  const rawSharedPostId =
    typeof candidate.sharedPostId === "string"
      ? candidate.sharedPostId
      : typeof candidate.postId === "string"
        ? candidate.postId
        : null;
  const rawShareText =
    typeof candidate.shareText === "string"
      ? candidate.shareText
      : typeof candidate.text === "string"
        ? candidate.text
        : "";

  if (!rawSharedPostId) {
    return null;
  }

  const sharedPostId = rawSharedPostId.trim();
  const shareText = rawShareText.trim();

  if (sharedPostId.length === 0) {
    return null;
  }

  return { sharedPostId, shareText };
}

async function canAccessPostAuthor(
  viewerProfileId: string,
  postAuthorId: string,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<{ ok: true; allowed: boolean } | { ok: false; response: NextResponse }> {
  if (viewerProfileId === postAuthorId) {
    return { ok: true, allowed: true };
  }

  const { data: friendships, error: friendshipsError } = await supabase
    .from("friendships")
    .select("user_a, user_b")
    .or(`user_a.eq.${viewerProfileId},user_b.eq.${viewerProfileId}`);

  if (friendshipsError) {
    console.error("Errore recupero amicizie in post/share:", friendshipsError);
    return {
      ok: false,
      response: NextResponse.json(
        { code: "FRIENDSHIPS_FETCH_ERROR", error: "Errore interno" },
        { status: 500 }
      ),
    };
  }

  const friendIds = new Set<string>();
  for (const friendship of (friendships ?? []) as FriendshipPair[]) {
    if (friendship.user_a === viewerProfileId) {
      friendIds.add(friendship.user_b);
      continue;
    }

    if (friendship.user_b === viewerProfileId) {
      friendIds.add(friendship.user_a);
    }
  }

  return { ok: true, allowed: friendIds.has(postAuthorId) };
}

export async function POST(req: NextRequest) {
  let requestBody: unknown;
  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_BODY", error: "Body JSON non valido" },
      { status: 400 }
    );
  }

  const body = parseBody(requestBody);
  if (!body) {
    return NextResponse.json(
      { code: "INVALID_SHARE_POST_INPUT", error: "Payload share non valido" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const auth = await resolveAuthenticatedProfileIdFromRequest(req, supabase);

  if (!auth.ok) {
    if (auth.code === "SESSION_REQUIRED") {
      return NextResponse.json(
        { code: "SESSION_REQUIRED", error: "Sessione mancante" },
        { status: 401 }
      );
    }

    if (auth.code === "INVALID_SESSION") {
      const res = NextResponse.json(
        { code: "INVALID_SESSION", error: "Sessione non valida" },
        { status: 401 }
      );
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    if (auth.code === "INVALID_SESSION_IDENTITY") {
      return NextResponse.json(
        { code: "INVALID_SESSION_IDENTITY", error: "Sessione non valida" },
        { status: 401 }
      );
    }

    if (auth.code === "PROFILE_RESOLUTION_ERROR") {
      console.error("Errore risoluzione profilo in post/share:", auth.error);
      return NextResponse.json(
        { code: "PROFILE_RESOLUTION_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { code: "PROFILE_NOT_FOUND", error: "Profilo non trovato" },
      { status: 404 }
    );
  }

  const { data: targetPostIdentity, error: targetPostError } = await supabase
    .from("post")
    .select("id, authorId")
    .eq("id", body.sharedPostId)
    .limit(1)
    .maybeSingle<TargetPostIdentityRow>();

  if (targetPostError) {
    console.error("Errore recupero post condiviso in post/share:", targetPostError);
    return NextResponse.json(
      { code: "POST_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!targetPostIdentity) {
    return NextResponse.json(
      { code: "POST_NOT_FOUND", error: "Post da condividere non trovato" },
      { status: 404 }
    );
  }

  const permissionCheck = await canAccessPostAuthor(
    auth.profileId,
    targetPostIdentity.authorId,
    supabase
  );
  if (!permissionCheck.ok) {
    return permissionCheck.response;
  }

  if (!permissionCheck.allowed) {
    return NextResponse.json(
      { code: "POST_ACCESS_DENIED", error: "Non autorizzato" },
      { status: 401 }
    );
  }

  const sharePostToInsert: PostInsert = {
    authorId: auth.profileId,
    content: body.shareText.length > 0 ? body.shareText : null,
    postType: "shareTextPost",
    extraContent: targetPostIdentity.id,
  };

  const { data: createdSharePost, error: createSharePostError } = await supabase
    .from("post")
    .insert(sharePostToInsert)
    .select("id, authorId, content, extraContent, mediaUrl, postType, created_at")
    .limit(1)
    .single<CreatedSharePostRow>();

  if (createSharePostError || !createdSharePost) {
    console.error("Errore creazione share post in post/share:", createSharePostError);
    return NextResponse.json(
      { code: "SHARE_POST_CREATE_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (targetPostIdentity.authorId !== auth.profileId) {
    const generatedNotificationNavigation = `/post/${encodeURIComponent(
      createdSharePost.id
    )}?${SHARE_NOTIFICATION_KIND_QUERY_PARAM}=${encodeURIComponent(
      SHARE_NOTIFICATION_KIND_VALUE
    )}`;
    const notificationToCreate: NotificationsInsert = {
      activity_from: auth.profileId,
      to: targetPostIdentity.authorId,
      generatedNavigation: generatedNotificationNavigation,
      // Fallback: notificationtype enum in DB currently has no postShared value.
      notificationType: "postReacted",
      seen: false,
    };

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notificationToCreate);

    if (notificationError) {
      console.error("Errore creazione notifica share post in post/share:", notificationError);
      return NextResponse.json(
        { code: "NOTIFICATION_CREATE_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      code: "POST_SHARED",
      post: {
        id: createdSharePost.id,
        authorId: createdSharePost.authorId,
        content: createdSharePost.content ?? "",
        extraContent: createdSharePost.extraContent,
        mediaUrl: createdSharePost.mediaUrl,
        postType: createdSharePost.postType,
        createdAt: createdSharePost.created_at,
      },
    },
    { status: 201 }
  );
}
