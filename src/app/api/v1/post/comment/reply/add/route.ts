import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import { PROFILE_METADATA_SELECT } from "@/app/api/v1/post/get/feedDto";
import type {
  CommentReplyInsert,
  CommentReplyRow,
  CommentRow,
  NotificationsInsert,
} from "@/types/db.generated";
import type {
  CommentReplyData,
  ProfileMetadata,
} from "@/lib/interfaces/CommonInterfaces";

export interface CommentReplyPayload {
  CommentId: string;
  CommentReplyText: string;
}

type AddCommentReplyBody = {
  CommentId?: unknown;
  CommentReplyText?: unknown;
  commentId?: unknown;
  commentReplyText?: unknown;
};

type TargetCommentRow = Pick<
  CommentRow,
  "commentId" | "commentAuthorId" | "postid"
>;
type PostCommenterRow = Pick<CommentRow, "commentAuthorId">;

type CreatedCommentReplyRow = Pick<
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

function parseBody(
  body: unknown
): { commentId: string; commentReplyText: string } | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as AddCommentReplyBody;
  const rawCommentId =
    typeof candidate.commentId === "string"
      ? candidate.commentId
      : typeof candidate.CommentId === "string"
        ? candidate.CommentId
        : null;
  const rawCommentReplyText =
    typeof candidate.commentReplyText === "string"
      ? candidate.commentReplyText
      : typeof candidate.CommentReplyText === "string"
        ? candidate.CommentReplyText
        : null;

  if (!rawCommentId || !rawCommentReplyText) {
    return null;
  }

  const commentId = rawCommentId.trim();
  const commentReplyText = rawCommentReplyText.trim();
  if (commentId.length === 0 || commentReplyText.length === 0) {
    return null;
  }

  return { commentId, commentReplyText };
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
      { code: "INVALID_COMMENT_REPLY_INPUT", error: "Payload reply non valido" },
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
      console.error("Errore risoluzione profilo in comment/reply/add:", auth.error);
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

  const { data: targetComment, error: targetCommentError } = await supabase
    .from("comment")
    .select("commentId, commentAuthorId, postid")
    .eq("commentId", body.commentId)
    .limit(1)
    .maybeSingle<TargetCommentRow>();

  if (targetCommentError) {
    console.error(
      "Errore verifica commento in comment/reply/add:",
      targetCommentError
    );
    return NextResponse.json(
      { code: "COMMENT_CHECK_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!targetComment) {
    return NextResponse.json(
      { code: "COMMENT_NOT_FOUND", error: "Commento non trovato" },
      { status: 404 }
    );
  }

  const newReply: CommentReplyInsert = {
    commentReplyAuthorId: auth.profileId,
    repliedComment: targetComment.commentId,
    text: body.commentReplyText,
  };

  const { data: createdReply, error: createReplyError } = await supabase
    .from("commentReply")
    .insert(newReply)
    .select(
      "commentReplyId, commentReplyAuthorId, repliedComment, text, mediaUrl, extraContent, created_at"
    )
    .limit(1)
    .single<CreatedCommentReplyRow>();

  if (createReplyError || !createdReply) {
    console.error("Errore creazione reply in comment/reply/add:", createReplyError);
    return NextResponse.json(
      { code: "COMMENT_REPLY_CREATE_ERROR", error: "Errore interno" },
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
      "Errore recupero autore reply in comment/reply/add:",
      authorFetchError
    );
    return NextResponse.json(
      { code: "REPLY_AUTHOR_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const authorProfile = toProfileMetadata(authorRow, auth.profileId);

  const notificationsToCreate: NotificationsInsert[] = [];
  const parentPostId =
    typeof targetComment.postid === "string" && targetComment.postid.trim().length > 0
      ? targetComment.postid
      : null;
  const replyNavigationBase = parentPostId
    ? `/post/${encodeURIComponent(parentPostId)}?commentId=${encodeURIComponent(
        targetComment.commentId
      )}&replyId=${encodeURIComponent(createdReply.commentReplyId)}`
    : null;

  if (
    replyNavigationBase &&
    targetComment.commentAuthorId &&
    targetComment.commentAuthorId !== auth.profileId
  ) {
    notificationsToCreate.push({
      activity_from: auth.profileId,
      to: targetComment.commentAuthorId,
      generatedNavigation: `${replyNavigationBase}&replyNotif=owner`,
      notificationType: "commentReplied",
      seen: false,
    });
  }

  if (replyNavigationBase && parentPostId) {
    const { data: postCommenters, error: postCommentersError } = await supabase
      .from("comment")
      .select("commentAuthorId")
      .eq("postid", parentPostId);

    if (postCommentersError) {
      console.error(
        "Errore recupero commentatori del post in comment/reply/add:",
        postCommentersError
      );
      return NextResponse.json(
        { code: "POST_COMMENTERS_FETCH_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    const postCommenterIds = new Set<string>();
    for (const row of (postCommenters ?? []) as PostCommenterRow[]) {
      if (!row.commentAuthorId) {
        continue;
      }

      const commenterId = row.commentAuthorId.trim();
      if (
        commenterId.length === 0 ||
        commenterId === auth.profileId ||
        commenterId === targetComment.commentAuthorId
      ) {
        continue;
      }

      postCommenterIds.add(commenterId);
    }

    for (const commenterId of postCommenterIds) {
      notificationsToCreate.push({
        activity_from: auth.profileId,
        to: commenterId,
        generatedNavigation: `${replyNavigationBase}&replyNotif=also`,
        notificationType: "commentReplied",
        seen: false,
      });
    }
  }

  if (notificationsToCreate.length > 0) {
    const { error: createNotificationsError } = await supabase
      .from("notifications")
      .insert(notificationsToCreate);

    if (createNotificationsError) {
      console.error(
        "Errore creazione notifiche in comment/reply/add:",
        createNotificationsError
      );
      return NextResponse.json(
        { code: "NOTIFICATION_CREATE_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }
  }

  const replyForClient: CommentReplyData = {
    commentReplyId: createdReply.commentReplyId,
    repliedCommentId: createdReply.repliedComment,
    authorId: createdReply.commentReplyAuthorId ?? auth.profileId,
    authorName: authorProfile?.username ?? "",
    replyAuthorPropic: authorProfile?.avatarUrl ?? "",
    repliedAt: createdReply.created_at,
    commentReplyText: createdReply.text ?? body.commentReplyText,
    commentReplyMediaUrl: createdReply.mediaUrl,
    commentReplyExtraContent: createdReply.extraContent,
    authorProfile,
    createdAt: createdReply.created_at,
    commentReplyReactions: [],
  };

  return NextResponse.json(
    {
      code: "COMMENT_REPLY_CREATED",
      postId: parentPostId,
      commentId: targetComment.commentId,
      reply: replyForClient,
    },
    { status: 201 }
  );
}
