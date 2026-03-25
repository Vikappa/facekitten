import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type {
  CommentInsert,
  CommentRow,
  NotificationsInsert,
  PostRow,
} from "@/types/db.generated";
import type { CommentData } from "@/lib/interfaces/CommonInterfaces";

type AddCommentBody = {
  postId?: unknown;
  commentText?: unknown;
};

type PostAuthorRow = Pick<PostRow, "id" | "authorId">;

type CommentAuthorRow = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
};

type CreatedCommentRow = Pick<CommentRow, "id" | "authorId" | "commentText" | "created_at"> & {
  author: CommentAuthorRow | CommentAuthorRow[] | null;
};

function parseBody(body: unknown): { postId: string; commentText: string } | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as AddCommentBody;
  if (typeof candidate.postId !== "string" || typeof candidate.commentText !== "string") {
    return null;
  }

  const postId = candidate.postId.trim();
  const commentText = candidate.commentText.trim();
  if (postId.length === 0 || commentText.length === 0) {
    return null;
  }

  return { postId, commentText };
}

function pickSingleRelationRow<T extends Record<string, unknown>>(
  value: T | T[] | null | undefined
): T | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
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
      { code: "INVALID_COMMENT_INPUT", error: "Payload commento non valido" },
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
      console.error("Errore risoluzione profilo in comment/add:", auth.error);
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

  const { data: targetPost, error: targetPostError } = await supabase
    .from("post")
    .select("id, authorId")
    .eq("id", body.postId)
    .limit(1)
    .maybeSingle<PostAuthorRow>();

  if (targetPostError) {
    console.error("Errore verifica post in comment/add:", targetPostError);
    return NextResponse.json(
      { code: "POST_CHECK_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!targetPost) {
    return NextResponse.json(
      { code: "POST_NOT_FOUND", error: "Post non trovato" },
      { status: 404 }
    );
  }

  const newComment: CommentInsert = {
    authorId: auth.profileId,
    postid: targetPost.id,
    commentText: body.commentText,
  };

  const { data: createdComment, error: createCommentError } = await supabase
    .from("comment")
    .insert(newComment)
    .select(
      `
        id,
        authorId,
        commentText,
        created_at,
        author:Profile!comment_authorId_fkey (
          id,
          username,
          avatarUrl
        )
      `
    )
    .limit(1)
    .single<CreatedCommentRow>();

  if (createCommentError || !createdComment) {
    console.error("Errore creazione commento in comment/add:", createCommentError);
    return NextResponse.json(
      { code: "COMMENT_CREATE_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (targetPost.authorId && targetPost.authorId !== auth.profileId) {
    const newNotification: NotificationsInsert = {
      activity_from: auth.profileId,
      to: targetPost.authorId,
      generatedNavigation: `/post/${encodeURIComponent(targetPost.id)}`,
      notificationType: "postCommented",
      seen: false,
    };

    const { error: createNotificationError } = await supabase
      .from("notifications")
      .insert(newNotification);

    if (createNotificationError) {
      console.error(
        "Errore creazione notifica commento in comment/add:",
        createNotificationError
      );
      return NextResponse.json(
        { code: "NOTIFICATION_CREATE_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }
  }

  const author = pickSingleRelationRow(createdComment.author);

  const commentForClient: CommentData = {
    authorId: createdComment.authorId ?? auth.profileId,
    authorName: author?.username ?? "",
    commentAuthorPropic: author?.avatarUrl ?? "",
    commentedAt: createdComment.created_at,
    reactions: [],
    reactionNumbers: 0,
    commentText: createdComment.commentText ?? body.commentText,
    commentReplies:[],
    commentRepliesCount:0
  };

  return NextResponse.json(
    {
      code: "COMMENT_CREATED",
      postId: targetPost.id,
      comment: commentForClient,
    },
    { status: 201 }
  );
}
