import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { FriendshipsRow } from "@/types/db.generated";
import type { Database } from "@/types/database.types";
import {
  CommentData,
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

  let postQuery = supabase.from("post").select(
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
  );

  if (postId) {
    postQuery = postQuery.eq("id", postId);
  }

  const { data: postRows, error: postError } = await postQuery
    .order("createdAt", { ascending: false })
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

  const comments = mapComments(selectedPost.comments);
  const reactions = mapReactions(selectedPost.postReactions);

  const responsePost: PostData = {
    postId: selectedPost.id,
    postType: selectedPost.postType ?? "post",
    text: selectedPost.content ?? "",
    imageUrl: selectedPost.author?.avatarUrl ?? undefined,
    authorId: selectedPost.authorId,
    authorName: selectedPost.author?.username ?? "",
    postImageUrl: selectedPost.mediaUrl ?? undefined,
    postedAt: selectedPost.createdAt,
    comments,
    commentNumber: comments.length,
    reactions,
    reactionsNumber: reactions.length,
    shares: {
      sharePostId: 0,
    },
  };

  return NextResponse.json(responsePost);
}
