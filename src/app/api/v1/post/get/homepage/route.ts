import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { loadUnreadNotificationDtosForProfile } from "@/lib/services/notifications/loadUnreadNotificationDtos";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { FriendshipsRow } from "@/types/db.generated";
import type { Database } from "@/types/database.types";
import {
  CommentData,
  CommentReplyData,
  PostData,
  ReactionData,
  ReactionType as UiReactionType,
} from "@/lib/interfaces/CommonInterfaces";

type FriendshipPair = Pick<FriendshipsRow, "user_a" | "user_b">;
type DbReactionType = Database["public"]["Enums"]["ReactionType"];
type DbPostType = Database["public"]["Enums"]["postType"];

type FeedAuthor = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
};

type FeedCommentReaction = {
  id: number;
  reactionType: DbReactionType | null;
  athorId: string | null;
  author: FeedAuthor | null;
};

type FeedCommentReply = {
  id: number;
  authorId: string | null;
  text: string | null;
  created_at: string;
  author: FeedAuthor | null;
};

type FeedComment = {
  id: number;
  authorId: string | null;
  commentText: string | null;
  created_at: string;
  author: FeedAuthor | null;
  commentReactions: FeedCommentReaction[] | null;
  commentReplies: FeedCommentReply[] | null;
};

type FeedPostReaction = {
  id: number;
  reactionType: DbReactionType | null;
  authorId: string | null;
  author: FeedAuthor | null;
};

type FeedPost = {
  id: string;
  authorId: string;
  content: string | null;
  mediaUrl: string | null;
  postType: DbPostType | null;
  createdAt: string;
  author: FeedAuthor | null;
  comments: FeedComment[] | null;
  postReactions: FeedPostReaction[] | null;
};

const REACTION_TYPE_MAP: Record<DbReactionType, UiReactionType> = {
  like: UiReactionType.like,
  love: UiReactionType.love,
  care: UiReactionType.care,
  laugh: UiReactionType.laugh,
  wow: UiReactionType.wow,
  sad: UiReactionType.sad,
  angry: UiReactionType.angry,
  gay: UiReactionType.gay,
  flower: UiReactionType.flower,
  boom: UiReactionType.boom,
};

function mapReactionType(value: DbReactionType | null): UiReactionType {
  if (!value) {
    return UiReactionType.like;
  }
  return REACTION_TYPE_MAP[value];
}

function mapComments(rawComments: FeedComment[] | null): CommentData[] {
  return (rawComments ?? []).map((comment) => {
    const commentReactions = comment.commentReactions ?? [];
    const commentReplies = mapCommentReplies(comment.commentReplies);

    return {
      commentId:comment.id,
      authorId: comment.authorId ?? "",
      authorName: comment.author?.username ?? "",
      commentAuthorPropic: comment.author?.avatarUrl ?? "",
      commentedAt: comment.created_at,
      reactions: commentReactions.map((reaction) => ({
        reactionId: String(reaction.id),
        reactionType: mapReactionType(reaction.reactionType),
        author: reaction.author?.username ?? "",
      })),
      reactionNumbers: commentReactions.length,
      commentText: comment.commentText ?? "",
      commentReplies,
      commentRepliesCount: commentReplies.length,
    };
  });
}

function mapCommentReplies(rawReplies: FeedCommentReply[] | null): CommentReplyData[] {
  return [...(rawReplies ?? [])]
    .sort((a, b) => {
      const aTimestamp = Date.parse(a.created_at);
      const bTimestamp = Date.parse(b.created_at);
      const hasValidATimestamp = Number.isFinite(aTimestamp);
      const hasValidBTimestamp = Number.isFinite(bTimestamp);

      if (hasValidATimestamp && hasValidBTimestamp && aTimestamp !== bTimestamp) {
        return aTimestamp - bTimestamp;
      }

      return a.id - b.id;
    })
    .map((reply) => ({
    authorId: reply.authorId ?? "",
    authorName: reply.author?.username ?? "",
    replyAuthorPropic: reply.author?.avatarUrl ?? "",
    repliedAt: reply.created_at,
    commentReplyReactions: [],
  }));
}

function mapReactions(rawReactions: FeedPostReaction[] | null): ReactionData[] {
  return (rawReactions ?? []).map((reaction) => ({
    reactionId: String(reaction.id),
    reactionType: mapReactionType(reaction.reactionType),
    author: reaction.author?.username ?? "",
  }));
}

export async function GET(req: NextRequest) {
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
      console.error("Errore risoluzione profilo in homepage feed:", auth.error);
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

  const { data: friendships, error: friendshipsError } = await supabase
    .from("friendships")
    .select("user_a, user_b")
    .or(`user_a.eq.${auth.profileId},user_b.eq.${auth.profileId}`);

  if (friendshipsError) {
    console.error("Errore recupero amicizie homepage:", friendshipsError);
    return NextResponse.json(
      { code: "FRIENDSHIPS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const authorIds = new Set<string>([auth.profileId]);

  for (const friendship of (friendships ?? []) as FriendshipPair[]) {
    if (friendship.user_a === auth.profileId) {
      authorIds.add(friendship.user_b);
      continue;
    }

    if (friendship.user_b === auth.profileId) {
      authorIds.add(friendship.user_a);
    }
  }

  const authorIdsList = Array.from(authorIds);

  const { data: feedRows, error: feedError } = await supabase
    .from("post")
    .select(
      `
        id,
        authorId,
        content,
        mediaUrl,
        postType,
        createdAt,
        author:Profile!Post_authorId_fkey (
          id,
          username,
          avatarUrl
        ),
        comments:comment!comment_postid_fkey (
          id,
          authorId,
          commentText,
          created_at,
          author:Profile!comment_authorId_fkey (
            id,
            username,
            avatarUrl
          ),
          commentReactions:commentReaction!commentReaction_commentId_fkey (
            id,
            reactionType,
            athorId,
            author:Profile!commentReaction_athorId_fkey (
              id,
              username,
              avatarUrl
            )
          ),
          commentReplies:commentReply!commentReply_commentId_fkey (
            id,
            authorId,
            text,
            created_at,
            author:Profile!commentReply_authorId_fkey (
              id,
              username,
              avatarUrl
            )
          )
        ),
        postReactions:postReaction!postReaction_postId_fkey (
          id,
          reactionType,
          authorId,
          author:Profile!postReaction_authorId_fkey (
            id,
            username,
            avatarUrl
          )
        )
      `
    )
    .in("authorId", authorIdsList)
    .order("createdAt", { ascending: false })
    .limit(20);

  if (feedError) {
    console.error("Errore recupero feed homepage:", feedError);
    return NextResponse.json(
      { code: "POSTS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const posts: PostData[] = ((feedRows ?? []) as FeedPost[]).map((post) => {
    const comments = mapComments(post.comments);
    const reactions = mapReactions(post.postReactions);

    return {
      postId: post.id,
      postType: post.postType ?? "post",
      text: post.content ?? "",
      imageUrl: post.author?.avatarUrl ?? undefined,
      authorId: post.authorId,
      authorName: post.author?.username ?? "",
      postImageUrl: post.mediaUrl ?? undefined,
      postedAt: post.createdAt,
      comments,
      commentNumber: comments.length,
      reactions,
      reactionsNumber: reactions.length,
      shares: {
        sharePostId: 0,
      },
    };
  });

  const unreadNotificationsResult = await loadUnreadNotificationDtosForProfile({
    profileId: auth.profileId,
    supabase,
    limit: 100,
  });

  if (!unreadNotificationsResult.ok) {
    console.error(
      "Errore recupero notifiche non viste homepage:",
      unreadNotificationsResult.error
    );
    return NextResponse.json(
      { code: "UNREAD_NOTIFICATIONS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    posts,
    unreadNotifications: unreadNotificationsResult.notifications,
  });
}
