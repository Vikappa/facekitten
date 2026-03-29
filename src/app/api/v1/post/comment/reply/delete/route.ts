import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { CommentReplyRow, CommentRow, PostRow } from "@/types/db.generated";

export type DeleteCommentReplyPayload = {
  commentReplyId: string;
};

type DeleteCommentReplyBody = {
  CommentReplyId?: unknown;
  commentReplyId?: unknown;
};

type CommentReplyIdentityRow = Pick<
  CommentReplyRow,
  "commentReplyId" | "commentReplyAuthorId" | "repliedComment"
>;

type CommentIdentityRow = Pick<CommentRow, "commentId" | "postid">;
type PostIdentityRow = Pick<PostRow, "id" | "authorId">;

function parseBody(body: unknown): DeleteCommentReplyPayload | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as DeleteCommentReplyBody;
  const rawCommentReplyId =
    typeof candidate.commentReplyId === "string"
      ? candidate.commentReplyId
      : typeof candidate.CommentReplyId === "string"
        ? candidate.CommentReplyId
        : null;

  if (!rawCommentReplyId) {
    return null;
  }

  const commentReplyId = rawCommentReplyId.trim();
  if (commentReplyId.length === 0) {
    return null;
  }

  return { commentReplyId };
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
        code: "INVALID_COMMENT_REPLY_DELETE_INPUT",
        error: "commentReplyId non valido",
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
      console.error("Errore risoluzione profilo in comment/reply/delete:", auth.error);
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

  const { data: replyIdentity, error: replyIdentityError } = await supabase
    .from("commentReply")
    .select("commentReplyId, commentReplyAuthorId, repliedComment")
    .eq("commentReplyId", body.commentReplyId)
    .limit(1)
    .maybeSingle<CommentReplyIdentityRow>();

  if (replyIdentityError) {
    console.error("Errore recupero reply in delete:", replyIdentityError);
    return NextResponse.json(
      { code: "COMMENT_REPLY_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!replyIdentity) {
    return NextResponse.json(
      { code: "COMMENT_REPLY_NOT_FOUND", error: "Reply non trovata" },
      { status: 404 }
    );
  }

  let canDeleteReply = replyIdentity.commentReplyAuthorId === auth.profileId;

  if (!canDeleteReply) {
    const parentCommentId =
      typeof replyIdentity.repliedComment === "string" &&
      replyIdentity.repliedComment.trim().length > 0
        ? replyIdentity.repliedComment
        : null;

    if (!parentCommentId) {
      return NextResponse.json(
        { code: "COMMENT_REPLY_FORBIDDEN", error: "Non puoi eliminare questa reply" },
        { status: 403 }
      );
    }

    const { data: parentComment, error: parentCommentError } = await supabase
      .from("comment")
      .select("commentId, postid")
      .eq("commentId", parentCommentId)
      .limit(1)
      .maybeSingle<CommentIdentityRow>();

    if (parentCommentError) {
      console.error(
        "Errore recupero commento parent in comment/reply/delete:",
        parentCommentError
      );
      return NextResponse.json(
        { code: "COMMENT_FETCH_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    if (!parentComment) {
      return NextResponse.json(
        { code: "COMMENT_NOT_FOUND", error: "Commento non trovato" },
        { status: 404 }
      );
    }

    if (typeof parentComment.postid === "string" && parentComment.postid.length > 0) {
      const { data: parentPost, error: parentPostError } = await supabase
        .from("post")
        .select("id, authorId")
        .eq("id", parentComment.postid)
        .limit(1)
        .maybeSingle<PostIdentityRow>();

      if (parentPostError) {
        console.error(
          "Errore recupero post parent in comment/reply/delete:",
          parentPostError
        );
        return NextResponse.json(
          { code: "POST_FETCH_ERROR", error: "Errore interno" },
          { status: 500 }
        );
      }

      if (!parentPost) {
        return NextResponse.json(
          { code: "POST_NOT_FOUND", error: "Post non trovato" },
          { status: 404 }
        );
      }

      canDeleteReply = parentPost.authorId === auth.profileId;
    }
  }

  if (!canDeleteReply) {
    return NextResponse.json(
      { code: "COMMENT_REPLY_FORBIDDEN", error: "Non puoi eliminare questa reply" },
      { status: 403 }
    );
  }

  const { error: deleteReplyReactionsError } = await supabase
    .from("CommentReplyReaction")
    .delete()
    .eq("commentReplyReacted", body.commentReplyId);

  if (deleteReplyReactionsError) {
    console.error(
      "Errore delete reazioni reply in comment/reply/delete:",
      deleteReplyReactionsError
    );
    return NextResponse.json(
      { code: "DELETE_COMMENT_REPLY_REACTIONS_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const { error: deleteReplyError } = await supabase
    .from("commentReply")
    .delete()
    .eq("commentReplyId", body.commentReplyId);

  if (deleteReplyError) {
    console.error("Errore delete reply:", deleteReplyError);
    return NextResponse.json(
      { code: "DELETE_COMMENT_REPLY_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    code: "COMMENT_REPLY_DELETED",
    commentReplyId: body.commentReplyId,
    commentId: replyIdentity.repliedComment,
  });
}
