import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type {
  CommentReactionInsert,
  CommentReactionRow,
  CommentRow,
  NotificationsInsert,
} from "@/types/db.generated";
import type { Database } from "@/types/database.types";
import { ReactionType as UiReactionType } from "@/lib/interfaces/CommonInterfaces";

type DbReactionType = Database["public"]["Enums"]["ReactionType"];

type ReactToCommentPayload = {
  commentId: string;
  reactionType: DbReactionType;
};

type RawReactionData = {
  targetId?: unknown;
  reactionType?: unknown;
};

type ReactToCommentBody = {
  CommentId?: unknown;
  commentId?: unknown;
  ReactionType?: unknown;
  reactionType?: unknown;
  reactionData?: unknown;
};

type CommentIdentityRow = Pick<CommentRow, "commentId" | "commentAuthorId" | "postid">;

type ExistingCommentReactionRow = Pick<
  CommentReactionRow,
  "commReactId" | "reactedComment" | "reactionAuthorId" | "reactionType" | "created_at"
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

function parseBody(body: unknown): ReactToCommentPayload | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as ReactToCommentBody;
  const rawReactionData =
    typeof candidate.reactionData === "object" && candidate.reactionData !== null
      ? (candidate.reactionData as RawReactionData)
      : null;

  const rawCommentId =
    typeof candidate.commentId === "string"
      ? candidate.commentId
      : typeof candidate.CommentId === "string"
        ? candidate.CommentId
        : typeof rawReactionData?.targetId === "string"
          ? rawReactionData.targetId
          : null;

  const reactionType = parseReactionType(
    candidate.reactionType ?? candidate.ReactionType ?? rawReactionData?.reactionType
  );

  if (!rawCommentId || !reactionType) {
    return null;
  }

  const commentId = rawCommentId.trim();
  if (commentId.length === 0) {
    return null;
  }

  return {
    commentId,
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
        code: "INVALID_COMMENT_REACTION_INPUT",
        error: "commentId o reactionType non validi",
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
      console.error("Errore risoluzione profilo in comment/react:", auth.error);
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

  const { data: commentIdentity, error: commentIdentityError } = await supabase
    .from("comment")
    .select("commentId, commentAuthorId, postid")
    .eq("commentId", body.commentId)
    .limit(1)
    .maybeSingle<CommentIdentityRow>();

  if (commentIdentityError) {
    console.error("Errore recupero commento in react:", commentIdentityError);
    return NextResponse.json(
      { code: "COMMENT_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!commentIdentity) {
    return NextResponse.json(
      { code: "COMMENT_NOT_FOUND", error: "Commento non trovato" },
      { status: 404 }
    );
  }

  const { data: existingReactions, error: existingReactionsError } = await supabase
    .from("commentReaction")
    .select(
      "commReactId, reactedComment, reactionAuthorId, reactionType, created_at"
    )
    .eq("reactedComment", body.commentId)
    .eq("reactionAuthorId", auth.profileId)
    .order("created_at", { ascending: false });

  if (existingReactionsError) {
    console.error("Errore recupero reazioni commento in comment/react:", existingReactionsError);
    return NextResponse.json(
      { code: "COMMENT_REACTION_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const reactionsByAuthor = (existingReactions ?? []) as ExistingCommentReactionRow[];
  const existingReactionIds = reactionsByAuthor
    .map((reaction) => reaction.commReactId)
    .filter((reactionId) => typeof reactionId === "string" && reactionId.length > 0);
  const hasSameReaction = reactionsByAuthor.some(
    (reaction) => reaction.reactionType === body.reactionType
  );

  if (hasSameReaction && existingReactionIds.length > 0) {
    const { error: removeReactionError } = await supabase
      .from("commentReaction")
      .delete()
      .in("commReactId", existingReactionIds);

    if (removeReactionError) {
      console.error("Errore rimozione reazione commento in comment/react:", removeReactionError);
      return NextResponse.json(
        { code: "COMMENT_REACTION_REMOVE_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code: "COMMENT_REACTION_REMOVED",
      commentId: body.commentId,
      reactionType: body.reactionType,
    });
  }

  if (existingReactionIds.length > 0) {
    const { error: clearExistingReactionError } = await supabase
      .from("commentReaction")
      .delete()
      .in("commReactId", existingReactionIds);

    if (clearExistingReactionError) {
      console.error(
        "Errore sostituzione reazione commento in comment/react:",
        clearExistingReactionError
      );
      return NextResponse.json(
        { code: "COMMENT_REACTION_REPLACE_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }
  }

  const newReaction: CommentReactionInsert = {
    reactedComment: body.commentId,
    reactionAuthorId: auth.profileId,
    reactionType: body.reactionType,
  };

  const { data: createdReaction, error: createReactionError } = await supabase
    .from("commentReaction")
    .insert(newReaction)
    .select("commReactId, reactedComment, reactionAuthorId, reactionType, created_at")
    .limit(1)
    .single<ExistingCommentReactionRow>();

  if (createReactionError || !createdReaction) {
    console.error("Errore creazione reazione commento in comment/react:", createReactionError);
    return NextResponse.json(
      { code: "COMMENT_REACTION_CREATE_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (existingReactionIds.length === 0) {
    const commentAuthorId = commentIdentity.commentAuthorId?.trim() ?? "";
    if (commentAuthorId.length > 0 && commentAuthorId !== auth.profileId) {
      const postId = commentIdentity.postid?.trim() ?? "";
      const generatedNavigation =
        postId.length > 0
          ? `/post/${encodeURIComponent(postId)}?commentId=${encodeURIComponent(
              body.commentId
            )}`
          : null;
      const notificationToCreate: NotificationsInsert = {
        activity_from: auth.profileId,
        to: commentAuthorId,
        generatedNavigation,
        notificationType: "commentReacted",
        seen: false,
      };

      const { error: createNotificationError } = await supabase
        .from("notifications")
        .insert(notificationToCreate);

      if (createNotificationError) {
        console.error(
          "Errore creazione notifica reazione commento in comment/react:",
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
    code:
      existingReactionIds.length > 0
        ? "COMMENT_REACTION_UPDATED"
        : "COMMENT_REACTION_CREATED",
    reaction: {
      id: createdReaction.commReactId,
      commentId: createdReaction.reactedComment,
      authorId: createdReaction.reactionAuthorId,
      reactionType: createdReaction.reactionType ?? body.reactionType,
      createdAt: createdReaction.created_at,
    },
  });
}
