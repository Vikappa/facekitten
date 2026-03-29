import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import { PROFILE_METADATA_SELECT } from "@/app/api/v1/post/get/feedDto";
import type { CommentReplyRow } from "@/types/db.generated";
import type {
  CommentReplyData,
  ProfileMetadata,
} from "@/lib/interfaces/CommonInterfaces";

export type EditCommentReplyPayload = {
  commentReplyId: string;
  commentReplyText: string;
};

type EditCommentReplyBody = {
  CommentReplyId?: unknown;
  CommentReplyText?: unknown;
  commentReplyId?: unknown;
  commentReplyText?: unknown;
};

type CommentReplyIdentityRow = Pick<
  CommentReplyRow,
  "commentReplyId" | "commentReplyAuthorId" | "repliedComment"
>;

type UpdatedCommentReplyRow = Pick<
  CommentReplyRow,
  | "commentReplyId"
  | "commentReplyAuthorId"
  | "repliedComment"
  | "text"
  | "mediaUrl"
  | "extraContent"
  | "created_at"
>;

type ReplyAuthorRow = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  confirmedAccount: boolean | null;
  created_at: string;
  updated_at: string | null;
  dataDiNascita: string | null;
  giocattoloPreferito: string | null;
  locationId: string | null;
  tipoCuccia: ProfileMetadata["tipoCuccia"];
};

function parseBody(body: unknown): EditCommentReplyPayload | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as EditCommentReplyBody;
  const rawCommentReplyId =
    typeof candidate.commentReplyId === "string"
      ? candidate.commentReplyId
      : typeof candidate.CommentReplyId === "string"
        ? candidate.CommentReplyId
        : null;
  const rawCommentReplyText =
    typeof candidate.commentReplyText === "string"
      ? candidate.commentReplyText
      : typeof candidate.CommentReplyText === "string"
        ? candidate.CommentReplyText
        : null;

  if (!rawCommentReplyId || !rawCommentReplyText) {
    return null;
  }

  const commentReplyId = rawCommentReplyId.trim();
  const commentReplyText = rawCommentReplyText.trim();
  if (commentReplyId.length === 0 || commentReplyText.length === 0) {
    return null;
  }

  return {
    commentReplyId,
    commentReplyText,
  };
}

function toProfileMetadata(
  author: ReplyAuthorRow | null,
  fallbackId?: string | null
): ProfileMetadata | null {
  if (!author && !fallbackId) {
    return null;
  }

  if (!author) {
    return {
      id: fallbackId ?? "",
      username: "",
      avatarUrl: "",
    };
  }

  return {
    id: author.id,
    username: author.username ?? "",
    avatarUrl: author.avatarUrl ?? "",
    bannerUrl: author.bannerUrl,
    bio: author.bio,
    confirmedAccount: author.confirmedAccount,
    createdAt: author.created_at,
    updatedAt: author.updated_at,
    dataDiNascita: author.dataDiNascita,
    giocattoloPreferito: author.giocattoloPreferito,
    locationId: author.locationId,
    tipoCuccia: author.tipoCuccia,
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
        code: "INVALID_COMMENT_REPLY_EDIT_INPUT",
        error: "commentReplyId o commentReplyText non validi",
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
      console.error("Errore risoluzione profilo in comment/reply/edit:", auth.error);
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
    console.error("Errore recupero reply in edit:", replyIdentityError);
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

  if (replyIdentity.commentReplyAuthorId !== auth.profileId) {
    return NextResponse.json(
      { code: "COMMENT_REPLY_FORBIDDEN", error: "Non puoi modificare questa reply" },
      { status: 403 }
    );
  }

  const { data: updatedReply, error: updateReplyError } = await supabase
    .from("commentReply")
    .update({ text: body.commentReplyText })
    .eq("commentReplyId", body.commentReplyId)
    .eq("commentReplyAuthorId", auth.profileId)
    .select(
      "commentReplyId, commentReplyAuthorId, repliedComment, text, mediaUrl, extraContent, created_at"
    )
    .single<UpdatedCommentReplyRow>();

  if (updateReplyError || !updatedReply) {
    console.error("Errore update reply:", updateReplyError);
    return NextResponse.json(
      { code: "UPDATE_COMMENT_REPLY_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const { data: authorRow, error: authorFetchError } = await supabase
    .from("Profile")
    .select(PROFILE_METADATA_SELECT)
    .eq("id", auth.profileId)
    .limit(1)
    .maybeSingle<ReplyAuthorRow>();

  if (authorFetchError) {
    console.error(
      "Errore recupero autore reply in comment/reply/edit:",
      authorFetchError
    );
    return NextResponse.json(
      { code: "REPLY_AUTHOR_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const authorProfile = toProfileMetadata(authorRow, auth.profileId);

  const replyForClient: CommentReplyData = {
    commentReplyId: updatedReply.commentReplyId,
    repliedCommentId: updatedReply.repliedComment,
    authorId: updatedReply.commentReplyAuthorId ?? auth.profileId,
    authorName: authorProfile?.username ?? "",
    replyAuthorPropic: authorProfile?.avatarUrl ?? "",
    repliedAt: updatedReply.created_at,
    commentReplyText: updatedReply.text ?? body.commentReplyText,
    commentReplyMediaUrl: updatedReply.mediaUrl,
    commentReplyExtraContent: updatedReply.extraContent,
    authorProfile,
    createdAt: updatedReply.created_at,
    commentReplyReactions: [],
  };

  return NextResponse.json({
    code: "COMMENT_REPLY_UPDATED",
    commentId: updatedReply.repliedComment,
    reply: replyForClient,
  });
}
