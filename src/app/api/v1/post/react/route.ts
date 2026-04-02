import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type {
  NotificationsInsert,
  PostReactionInsert,
  PostReactionRow,
  PostRow,
} from "@/types/db.generated";
import type { Database } from "@/types/database.types";
import { ReactionType as UiReactionType } from "@/lib/interfaces/CommonInterfaces";

type DbReactionType = Database["public"]["Enums"]["ReactionType"];

type ReactToPostPayload = {
  postId: string;
  reactionType: DbReactionType;
};

type RawReactionData = {
  targetId?: unknown;
  reactionType?: unknown;
};

type ReactToPostBody = {
  PostId?: unknown;
  postId?: unknown;
  ReactionType?: unknown;
  reactionType?: unknown;
  reactionData?: unknown;
};

type PostIdentityRow = Pick<PostRow, "id" | "authorId">;

type ExistingPostReactionRow = Pick<
  PostReactionRow,
  "id" | "reactedPost" | "reactedBy" | "reactionType" | "created_at"
>;

const DB_REACTION_TYPE_VALUES = [
  "like",
  "love",
  "care",
  "laugh",
  "wow",
  "sad",
  "angry",
  "gay",
  "flower",
  "boom",
] as const satisfies DbReactionType[];

const DB_REACTION_TYPES = new Set<DbReactionType>(DB_REACTION_TYPE_VALUES);

const UI_TO_DB_REACTION_MAP: Record<number, DbReactionType> = {
  [UiReactionType.like]: "like",
  [UiReactionType.love]: "love",
  [UiReactionType.care]: "care",
  [UiReactionType.laugh]: "laugh",
  [UiReactionType.wow]: "wow",
  [UiReactionType.sad]: "sad",
  [UiReactionType.angry]: "angry",
  [UiReactionType.gay]: "gay",
  [UiReactionType.flower]: "flower",
  [UiReactionType.boom]: "boom",
};

function parseReactionType(value: unknown): DbReactionType | null {
  if (typeof value === "string") {
    const normalized = value.trim() as DbReactionType;
    return DB_REACTION_TYPES.has(normalized) ? normalized : null;
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    return UI_TO_DB_REACTION_MAP[value] ?? null;
  }

  return null;
}

function parseBody(body: unknown): ReactToPostPayload | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as ReactToPostBody;
  const rawReactionData =
    typeof candidate.reactionData === "object" && candidate.reactionData !== null
      ? (candidate.reactionData as RawReactionData)
      : null;

  const rawPostId =
    typeof candidate.postId === "string"
      ? candidate.postId
      : typeof candidate.PostId === "string"
        ? candidate.PostId
        : typeof rawReactionData?.targetId === "string"
          ? rawReactionData.targetId
          : null;

  const reactionType = parseReactionType(
    candidate.reactionType ?? candidate.ReactionType ?? rawReactionData?.reactionType
  );

  if (!rawPostId || !reactionType) {
    return null;
  }

  const postId = rawPostId.trim();
  if (postId.length === 0) {
    return null;
  }

  return {
    postId,
    reactionType,
  };
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
      {
        code: "INVALID_POST_REACTION_INPUT",
        error: "postId o reactionType non validi",
      },
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
      console.error("Errore risoluzione profilo in post/react:", auth.error);
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

  const { data: postIdentity, error: postIdentityError } = await supabase
    .from("post")
    .select("id, authorId")
    .eq("id", body.postId)
    .limit(1)
    .maybeSingle<PostIdentityRow>();

  if (postIdentityError) {
    console.error("Errore recupero post in react:", postIdentityError);
    return NextResponse.json(
      { code: "POST_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!postIdentity) {
    return NextResponse.json(
      { code: "POST_NOT_FOUND", error: "Post non trovato" },
      { status: 404 }
    );
  }

  const { data: existingReactions, error: existingReactionsError } = await supabase
    .from("postReaction")
    .select("id, reactedPost, reactedBy, reactionType, created_at")
    .eq("reactedPost", body.postId)
    .eq("reactedBy", auth.profileId)
    .order("created_at", { ascending: false });

  if (existingReactionsError) {
    console.error("Errore recupero reazioni post in post/react:", existingReactionsError);
    return NextResponse.json(
      { code: "POST_REACTION_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const reactionsByAuthor = (existingReactions ?? []) as ExistingPostReactionRow[];
  const existingReactionIds = reactionsByAuthor
    .map((reaction) => reaction.id)
    .filter((reactionId) => typeof reactionId === "number" && Number.isFinite(reactionId));
  const hasSameReaction = reactionsByAuthor.some(
    (reaction) => reaction.reactionType === body.reactionType
  );

  if (hasSameReaction && existingReactionIds.length > 0) {
    const { error: removeReactionError } = await supabase
      .from("postReaction")
      .delete()
      .in("id", existingReactionIds);

    if (removeReactionError) {
      console.error("Errore rimozione reazione post in post/react:", removeReactionError);
      return NextResponse.json(
        { code: "POST_REACTION_REMOVE_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code: "POST_REACTION_REMOVED",
      postId: body.postId,
      reactionType: body.reactionType,
    });
  }

  if (existingReactionIds.length > 0) {
    const { error: clearExistingReactionError } = await supabase
      .from("postReaction")
      .delete()
      .in("id", existingReactionIds);

    if (clearExistingReactionError) {
      console.error(
        "Errore sostituzione reazione post in post/react:",
        clearExistingReactionError
      );
      return NextResponse.json(
        { code: "POST_REACTION_REPLACE_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }
  }

  const newReaction: PostReactionInsert = {
    reactedPost: body.postId,
    reactedBy: auth.profileId,
    reactionType: body.reactionType,
  };

  const { data: createdReaction, error: createReactionError } = await supabase
    .from("postReaction")
    .insert(newReaction)
    .select("id, reactedPost, reactedBy, reactionType, created_at")
    .limit(1)
    .single<ExistingPostReactionRow>();

  if (createReactionError || !createdReaction) {
    console.error("Errore creazione reazione post in post/react:", createReactionError);
    return NextResponse.json(
      { code: "POST_REACTION_CREATE_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (existingReactionIds.length === 0) {
    const postAuthorId = postIdentity.authorId?.trim() ?? "";
    if (postAuthorId.length > 0 && postAuthorId !== auth.profileId) {
      const notificationToCreate: NotificationsInsert = {
        activity_from: auth.profileId,
        to: postAuthorId,
        generatedNavigation: `/post/${encodeURIComponent(
          body.postId
        )}?postId=${encodeURIComponent(body.postId)}`,
        notificationType: "postReacted",
        seen: false,
      };

      const { error: createNotificationError } = await supabase
        .from("notifications")
        .insert(notificationToCreate);

      if (createNotificationError) {
        console.error(
          "Errore creazione notifica reazione post in post/react:",
          createNotificationError
        );
        return NextResponse.json(
          { code: "NOTIFICATION_CREATE_ERROR", error: "Errore interno" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({
    code: existingReactionIds.length > 0 ? "POST_REACTION_UPDATED" : "POST_REACTION_CREATED",
    reaction: {
      id: createdReaction.id,
      postId: createdReaction.reactedPost,
      authorId: createdReaction.reactedBy,
      reactionType: createdReaction.reactionType ?? body.reactionType,
      createdAt: createdReaction.created_at,
    },
  });
}
