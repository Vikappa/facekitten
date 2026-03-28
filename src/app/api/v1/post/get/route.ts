import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { FriendshipsRow } from "@/types/db.generated";
import {
  FEED_POST_SELECT,
  PROFILE_METADATA_SELECT,
  collectReplyAuthorIds,
  mapFeedPostsToPostData,
  type FeedAuthor,
  type FeedPost,
} from "@/app/api/v1/post/get/feedDto";

type FriendshipPair = Pick<FriendshipsRow, "user_a" | "user_b">;

function parsePostId(value: string | null): string | null | undefined {
  if (value === null) {
    return null;
  }

  const parsed = value.trim();
  if (parsed.length === 0) {
    return undefined;
  }

  return parsed;
}

async function isAuthorAllowed(
  viewerProfileId: string,
  postAuthorId: string,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<{ ok: true; allowed: boolean } | { ok: false; response: NextResponse }> {
  if (postAuthorId === viewerProfileId) {
    return { ok: true, allowed: true };
  }

  const { data: friendships, error: friendshipsError } = await supabase
    .from("friendships")
    .select("user_a, user_b")
    .or(`user_a.eq.${viewerProfileId},user_b.eq.${viewerProfileId}`);

  if (friendshipsError) {
    console.error("Errore recupero amicizie in post/get:", friendshipsError);
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

async function loadReplyAuthorsById(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  posts: FeedPost[]
): Promise<
  | { ok: true; replyAuthorsById: Map<string, FeedAuthor> }
  | { ok: false; response: NextResponse }
> {
  const replyAuthorIds = collectReplyAuthorIds(posts);
  if (replyAuthorIds.length === 0) {
    return { ok: true, replyAuthorsById: new Map<string, FeedAuthor>() };
  }

  const { data: replyAuthors, error: replyAuthorsError } = await supabase
    .from("Profile")
    .select(PROFILE_METADATA_SELECT)
    .in("id", replyAuthorIds);

  if (replyAuthorsError) {
    console.error("Errore recupero autori reply in post/get:", replyAuthorsError);
    return {
      ok: false,
      response: NextResponse.json(
        { code: "REPLY_AUTHORS_FETCH_ERROR", error: "Errore interno" },
        { status: 500 }
      ),
    };
  }

  const replyAuthorsById = new Map<string, FeedAuthor>();
  for (const author of (replyAuthors ?? []) as FeedAuthor[]) {
    if (typeof author.id === "string" && author.id.trim().length > 0) {
      replyAuthorsById.set(author.id, author);
    }
  }

  return { ok: true, replyAuthorsById };
}

export async function POST(req: NextRequest) {
  const postId = parsePostId(req.nextUrl.searchParams.get("id"));
  if (postId === undefined) {
    return NextResponse.json(
      { code: "INVALID_POST_ID", error: "Parametro id non valido" },
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
      console.error("Errore risoluzione profilo in post/get:", auth.error);
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

  let postQuery = supabase.from("post").select(FEED_POST_SELECT);

  if (postId) {
    postQuery = postQuery.eq("id", postId);
  }

  const { data: postRows, error: postError } = await postQuery
    .order("created_at", { ascending: false })
    .limit(1);

  if (postError) {
    console.error("Errore recupero post in post/get:", postError);
    return NextResponse.json(
      { code: "POST_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const selectedPost = ((postRows ?? []) as FeedPost[])[0];
  if (!selectedPost) {
    return NextResponse.json(
      { code: "POST_NOT_FOUND", error: "Post non trovato" },
      { status: 404 }
    );
  }

  const permissionCheck = await isAuthorAllowed(
    auth.profileId,
    selectedPost.authorId,
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

  const replyAuthorsResult = await loadReplyAuthorsById(supabase, [selectedPost]);
  if (!replyAuthorsResult.ok) {
    return replyAuthorsResult.response;
  }

  const [responsePost] = mapFeedPostsToPostData(
    [selectedPost],
    replyAuthorsResult.replyAuthorsById
  );

  if (!responsePost) {
    return NextResponse.json(
      { code: "POST_DTO_MAPPING_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json(responsePost);
}
