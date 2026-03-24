import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { Database } from "@/types/database.types";
import {
  CommentData,
  PostData,
  ReactionData,
  ReactionType as UiReactionType,
} from "@/lib/interfaces/CommonInterfaces";

export interface GetFriendPostRequest {
  friendId: string;
  alreadyGotPosts: string[];
}

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
};

type FeedComment = {
  id: number;
  authorId: string | null;
  commentText: string | null;
  created_at: string;
  author: FeedAuthor | null;
  commentReactions: FeedCommentReaction[] | null;
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

    return {
      authorId: comment.authorId ?? "",
      authorName: comment.author?.username ?? "",
      commentAuthorPropic: comment.author?.avatarUrl ?? "",
      commentedAt: comment.created_at,
      reactions: commentReactions.map((reaction) => ({
        reactionId: String(reaction.id),
        reactionType: mapReactionType(reaction.reactionType),
        author: "",
      })),
      reactionNumbers: commentReactions.length,
      commentText: comment.commentText ?? "",
    };
  });
}

function mapReactions(rawReactions: FeedPostReaction[] | null): ReactionData[] {
  return (rawReactions ?? []).map((reaction) => ({
    reactionId: String(reaction.id),
    reactionType: mapReactionType(reaction.reactionType),
    author: reaction.author?.username ?? "",
  }));
}

function normalizeExcludedPostIds(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );
}

function toPostgrestInFilter(values: string[]): string {
  const encodedValues = values.map((value) => `'${value.replace(/'/g, "''")}'`);
  return `(${encodedValues.join(",")})`;
}

export async function POST(req: NextRequest) {
  let payload: GetFriendPostRequest;
  try {
    payload = (await req.json()) as GetFriendPostRequest;
  } catch {
    return NextResponse.json(
      { code: "INVALID_BODY", error: "Body JSON non valido" },
      { status: 400 }
    );
  }

  const friendId =
    typeof payload.friendId === "string" ? payload.friendId.trim() : "";

  if (
    friendId.length === 0 ||
    !Array.isArray(payload.alreadyGotPosts) ||
    !payload.alreadyGotPosts.every((postId) => typeof postId === "string")
  ) {
    return NextResponse.json(
      { code: "INVALID_FRIEND_POST_INPUT", error: "Payload non valido" },
      { status: 400 }
    );
  }

  const alreadyGotPosts = normalizeExcludedPostIds(payload.alreadyGotPosts);

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
      console.error("Errore risoluzione profilo in friend feed:", auth.error);
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

  let postsQuery = supabase
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
            reactionType
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
    .eq("authorId", friendId);

  if (alreadyGotPosts.length > 0) {
    postsQuery = postsQuery.not("id", "in", toPostgrestInFilter(alreadyGotPosts));
  }

  const { data: feedRows, error: feedError } = await postsQuery
    .order("createdAt", { ascending: false })
    .limit(20);

  if (feedError) {
    console.error("Errore recupero feed friend:", feedError);
    return NextResponse.json(
      { code: "POSTS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const responseArray: PostData[] = ((feedRows ?? []) as FeedPost[]).map(
    (post) => {
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
    }
  );

  return NextResponse.json(responseArray);
}
