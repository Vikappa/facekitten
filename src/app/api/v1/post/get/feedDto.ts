import {
  type CommentData,
  type CommentReplyData,
  type PostData,
  type ProfileMetadata,
  type ReactionData,
  ReactionType as UiReactionType,
} from "@/lib/interfaces/CommonInterfaces";
import type { Database } from "@/types/database.types";

export type DbReactionType = Database["public"]["Enums"]["ReactionType"];

export type FeedAuthor = {
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
  tipoCuccia: Database["public"]["Enums"]["Lettino"] | null;
};

export type FeedCommentReaction = {
  commReactId: string;
  reactionType: DbReactionType | null;
  reactionAuthorId: string | null;
  reactedComment: string | null;
  created_at: string;
  author: FeedAuthor | null;
};

export type FeedCommentReplyReaction = {
  CommentReplyReactionId: string;
  commentReplyReactionAuthor: string | null;
  commentReplyReacted: string | null;
  reactionType: DbReactionType | null;
  created_at: string;
  author: FeedAuthor | null;
};

export type FeedCommentReply = {
  commentReplyId: string;
  commentReplyAuthorId: string | null;
  repliedComment: string | null;
  text: string | null;
  mediaUrl: string | null;
  extraContent: string | null;
  created_at: string;
  commentReplyReactions: FeedCommentReplyReaction[] | null;
};

export type FeedComment = {
  commentId: string;
  commentAuthorId: string | null;
  commentText: string | null;
  postid: string | null;
  extraContent: string | null;
  created_at: string;
  author: FeedAuthor | null;
  commentReactions: FeedCommentReaction[] | null;
  commentReplies: FeedCommentReply[] | null;
};

export type FeedPostReaction = {
  id: number;
  reactedPost: string | null;
  reactedBy: string | null;
  created_at: string;
  reactionType: DbReactionType | null;
  author: FeedAuthor | null;
};

export type FeedPost = {
  id: string;
  authorId: string;
  content: string | null;
  extraContent: string | null;
  mediaUrl: string | null;
  postType: Database["public"]["Enums"]["postType"] | null;
  created_at: string;
  author: FeedAuthor | null;
  comments: FeedComment[] | null;
  postReactions: FeedPostReaction[] | null;
};

export type FeedSharedPost = {
  id: string;
  authorId: string;
  content: string | null;
  extraContent: string | null;
  mediaUrl: string | null;
  postType: Database["public"]["Enums"]["postType"] | null;
  created_at: string;
  author: FeedAuthor | null;
  postReactions: FeedPostReaction[] | null;
};

export const PROFILE_METADATA_SELECT = `
  id,
  username,
  avatarUrl,
  bannerUrl,
  bio,
  confirmedAccount,
  created_at,
  updated_at,
  dataDiNascita,
  giocattoloPreferito,
  locationId,
  tipoCuccia
`;

export const FEED_POST_SELECT = `
  id,
  authorId,
  content,
  extraContent,
  mediaUrl,
  postType,
  created_at,
  author:Profile!Post_authorId_fkey (
    ${PROFILE_METADATA_SELECT}
  ),
  comments:comment!comment_postid_fkey (
    commentId,
    commentAuthorId,
    commentText,
    postid,
    extraContent,
    created_at,
    author:Profile!comment_commentAuthorId_fkey (
      ${PROFILE_METADATA_SELECT}
    ),
    commentReactions:commentReaction!commentReaction_reactedComment_fkey (
      commReactId,
      reactionType,
      reactionAuthorId,
      reactedComment,
      created_at,
      author:Profile!commentReaction_reactionAuthorId_fkey (
        ${PROFILE_METADATA_SELECT}
      )
    ),
    commentReplies:commentReply!commentReply_repliedComment_fkey (
      commentReplyId,
      commentReplyAuthorId,
      repliedComment,
      text,
      mediaUrl,
      extraContent,
      created_at,
      commentReplyReactions:CommentReplyReaction!CommentReplyReaction_commentReplyReacted_fkey (
        CommentReplyReactionId,
        commentReplyReactionAuthor,
        commentReplyReacted,
        reactionType,
        created_at,
        author:Profile!CommentReplyReaction_commentReplyReactionAuthor_fkey (
          ${PROFILE_METADATA_SELECT}
        )
      )
    )
  ),
  postReactions:postReaction!postReaction_reactedPost_fkey (
    id,
    reactedPost,
    reactedBy,
    created_at,
    reactionType,
    author:Profile!postReaction_reactedBy_fkey (
      ${PROFILE_METADATA_SELECT}
    )
  )
`;

export const FEED_SHARED_POST_SELECT = `
  id,
  authorId,
  content,
  extraContent,
  mediaUrl,
  postType,
  created_at,
  author:Profile!Post_authorId_fkey (
    ${PROFILE_METADATA_SELECT}
  ),
  postReactions:postReaction!postReaction_reactedPost_fkey (
    id,
    reactedPost,
    reactedBy,
    created_at,
    reactionType,
    author:Profile!postReaction_reactedBy_fkey (
      ${PROFILE_METADATA_SELECT}
    )
  )
`;

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

const SHARE_TEXT_POST_TYPES = new Set(["sharetextpost", "shareposttext"]);
const EMPTY_SHARED_POSTS_BY_ID = new Map<string, FeedSharedPost>();
const UUID_V4_OR_COMPAT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isShareTextPost(postType: string | null | undefined): boolean {
  if (typeof postType !== "string") {
    return false;
  }

  return SHARE_TEXT_POST_TYPES.has(postType.trim().toLowerCase());
}

function parseSharedPostId(rawExtraContent: string | null | undefined): string | null {
  if (typeof rawExtraContent !== "string") {
    return null;
  }

  const normalized = rawExtraContent.trim();
  if (normalized.length === 0) {
    return null;
  }

  if (!UUID_V4_OR_COMPAT_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

export function mapReactionType(value: DbReactionType | null): UiReactionType {
  if (!value) {
    return UiReactionType.like;
  }
  return REACTION_TYPE_MAP[value];
}

function mapProfileMetadata(
  profile: FeedAuthor | null,
  fallbackId?: string | null
): ProfileMetadata | null {
  if (!profile && !fallbackId) {
    return null;
  }

  if (!profile) {
    return {
      id: fallbackId ?? "",
      username: "",
      avatarUrl: "",
    };
  }

  return {
    id: profile.id,
    username: profile.username ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    bannerUrl: profile.bannerUrl,
    bio: profile.bio,
    confirmedAccount: profile.confirmedAccount,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    dataDiNascita: profile.dataDiNascita,
    giocattoloPreferito: profile.giocattoloPreferito,
    locationId: profile.locationId,
    tipoCuccia: profile.tipoCuccia,
  };
}

function mapCommentReplyReactions(
  rawReactions: FeedCommentReplyReaction[] | null
): ReactionData[] {
  return [...(rawReactions ?? [])]
    .sort((a, b) => {
      const aTimestamp = Date.parse(a.created_at);
      const bTimestamp = Date.parse(b.created_at);
      const hasValidATimestamp = Number.isFinite(aTimestamp);
      const hasValidBTimestamp = Number.isFinite(bTimestamp);

      if (hasValidATimestamp && hasValidBTimestamp && aTimestamp !== bTimestamp) {
        return aTimestamp - bTimestamp;
      }

      return a.CommentReplyReactionId.localeCompare(b.CommentReplyReactionId);
    })
    .map((reaction) => {
    const authorProfile = mapProfileMetadata(
      reaction.author,
      reaction.commentReplyReactionAuthor
    );

    return {
      reactionId: reaction.CommentReplyReactionId,
      reactionType: mapReactionType(reaction.reactionType),
      author: authorProfile?.username ?? reaction.commentReplyReactionAuthor ?? "",
      authorId: reaction.commentReplyReactionAuthor,
      authorAvatarUrl: authorProfile?.avatarUrl ?? null,
      authorProfile,
      createdAt: reaction.created_at,
      targetType: "commentReply",
      targetId: reaction.commentReplyReacted,
    };
  });
}

function mapCommentReplies(
  rawReplies: FeedCommentReply[] | null,
  replyAuthorsById: Map<string, FeedAuthor>
): CommentReplyData[] {
  return [...(rawReplies ?? [])]
    .sort((a, b) => {
      const aTimestamp = Date.parse(a.created_at);
      const bTimestamp = Date.parse(b.created_at);
      const hasValidATimestamp = Number.isFinite(aTimestamp);
      const hasValidBTimestamp = Number.isFinite(bTimestamp);

      if (hasValidATimestamp && hasValidBTimestamp && aTimestamp !== bTimestamp) {
        return aTimestamp - bTimestamp;
      }

      return a.commentReplyId.localeCompare(b.commentReplyId);
    })
    .map((reply) => {
      const authorProfile = mapProfileMetadata(
        reply.commentReplyAuthorId
          ? (replyAuthorsById.get(reply.commentReplyAuthorId) ?? null)
          : null,
        reply.commentReplyAuthorId
      );

      return {
        commentReplyId: reply.commentReplyId,
        repliedCommentId: reply.repliedComment,
        authorId: reply.commentReplyAuthorId ?? "",
        authorName: authorProfile?.username ?? reply.commentReplyAuthorId ?? "",
        replyAuthorPropic: authorProfile?.avatarUrl ?? "",
        repliedAt: reply.created_at,
        commentReplyText: reply.text ?? "",
        commentReplyMediaUrl: reply.mediaUrl,
        commentReplyExtraContent: reply.extraContent,
        authorProfile,
        createdAt: reply.created_at,
        commentReplyReactions: mapCommentReplyReactions(reply.commentReplyReactions),
      };
    });
}

function mapCommentReactions(rawReactions: FeedCommentReaction[] | null): ReactionData[] {
  return [...(rawReactions ?? [])]
    .sort((a, b) => {
      const aTimestamp = Date.parse(a.created_at);
      const bTimestamp = Date.parse(b.created_at);
      const hasValidATimestamp = Number.isFinite(aTimestamp);
      const hasValidBTimestamp = Number.isFinite(bTimestamp);

      if (hasValidATimestamp && hasValidBTimestamp && aTimestamp !== bTimestamp) {
        return aTimestamp - bTimestamp;
      }

      return a.commReactId.localeCompare(b.commReactId);
    })
    .map((reaction) => {
    const authorProfile = mapProfileMetadata(reaction.author, reaction.reactionAuthorId);

    return {
      reactionId: reaction.commReactId,
      reactionType: mapReactionType(reaction.reactionType),
      author: authorProfile?.username ?? reaction.reactionAuthorId ?? "",
      authorId: reaction.reactionAuthorId,
      authorAvatarUrl: authorProfile?.avatarUrl ?? null,
      authorProfile,
      createdAt: reaction.created_at,
      targetType: "comment",
      targetId: reaction.reactedComment,
    };
  });
}

function mapPostReactions(rawReactions: FeedPostReaction[] | null): ReactionData[] {
  return [...(rawReactions ?? [])]
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
    .map((reaction) => {
    const authorProfile = mapProfileMetadata(reaction.author, reaction.reactedBy);

    return {
      reactionId: String(reaction.id),
      reactionType: mapReactionType(reaction.reactionType),
      author: authorProfile?.username ?? reaction.reactedBy ?? "",
      authorId: reaction.reactedBy,
      authorAvatarUrl: authorProfile?.avatarUrl ?? null,
      authorProfile,
      createdAt: reaction.created_at,
      targetType: "post",
      targetId: reaction.reactedPost,
    };
  });
}

function mapComments(
  rawComments: FeedComment[] | null,
  replyAuthorsById: Map<string, FeedAuthor>
): CommentData[] {
  return [...(rawComments ?? [])]
    .sort((a, b) => {
      const aTimestamp = Date.parse(a.created_at);
      const bTimestamp = Date.parse(b.created_at);
      const hasValidATimestamp = Number.isFinite(aTimestamp);
      const hasValidBTimestamp = Number.isFinite(bTimestamp);

      if (hasValidATimestamp && hasValidBTimestamp && aTimestamp !== bTimestamp) {
        return aTimestamp - bTimestamp;
      }

      return a.commentId.localeCompare(b.commentId);
    })
    .map((comment) => {
    const authorProfile = mapProfileMetadata(comment.author, comment.commentAuthorId);
    const commentReplies = mapCommentReplies(comment.commentReplies, replyAuthorsById);
    const reactions = mapCommentReactions(comment.commentReactions);

    return {
      commentId: comment.commentId,
      authorId: comment.commentAuthorId ?? "",
      authorName: authorProfile?.username ?? comment.commentAuthorId ?? "",
      commentAuthorPropic: authorProfile?.avatarUrl ?? "",
      commentedAt: comment.created_at,
      reactions,
      reactionNumbers: reactions.length,
      commentText: comment.commentText ?? "",
      commentReplies,
      commentRepliesCount: commentReplies.length,
      postId: comment.postid,
      commentExtraContent: comment.extraContent,
      authorProfile,
      createdAt: comment.created_at,
    };
  });
}

export function collectReplyAuthorIds(posts: FeedPost[]): string[] {
  return Array.from(
    new Set(
      posts.flatMap((post) =>
        (post.comments ?? []).flatMap((comment) =>
          (comment.commentReplies ?? [])
            .map((reply) => reply.commentReplyAuthorId)
            .filter(
              (authorId): authorId is string =>
                !!authorId &&
                authorId.trim().length > 0 &&
                UUID_V4_OR_COMPAT_PATTERN.test(authorId.trim())
            )
        )
      )
    )
  );
}

export function collectSharedPostIds(posts: FeedPost[]): string[] {
  return Array.from(
    new Set(
      posts
        .filter((post) => isShareTextPost(post.postType))
        .map((post) => parseSharedPostId(post.extraContent))
        .filter((postId): postId is string => postId !== null)
    )
  );
}

function mapFeedPostToPostData(
  post: FeedPost | FeedSharedPost,
  replyAuthorsById: Map<string, FeedAuthor>,
  sharedPostsById: Map<string, FeedSharedPost>,
  options?: {
    stripCommentsAndReplies?: boolean;
    disableSharedSubPost?: boolean;
  }
): PostData {
  const authorProfile = mapProfileMetadata(post.author, post.authorId);
  const stripCommentsAndReplies = options?.stripCommentsAndReplies === true;
  const comments =
    !stripCommentsAndReplies && "comments" in post
      ? mapComments(post.comments, replyAuthorsById)
      : [];
  const reactions = mapPostReactions(post.postReactions);
  const postType = post.postType ?? "post";

  let subPostData: PostData | null = null;
  if (!options?.disableSharedSubPost && isShareTextPost(postType)) {
    const sharedPostId = parseSharedPostId(post.extraContent);
    if (sharedPostId) {
      const sharedPost = sharedPostsById.get(sharedPostId);
      if (sharedPost) {
        subPostData = mapFeedPostToPostData(
          sharedPost,
          replyAuthorsById,
          EMPTY_SHARED_POSTS_BY_ID,
          { stripCommentsAndReplies: true, disableSharedSubPost: true }
        );
      }
    }
  }

  return {
    postId: post.id,
    postType,
    text: post.content ?? "",
    imageUrl: authorProfile?.avatarUrl ?? undefined,
    authorId: post.authorId,
    authorName: authorProfile?.username ?? post.authorId,
    postImageUrl: post.mediaUrl ?? undefined,
    postedAt: post.created_at,
    comments,
    commentNumber: comments.length,
    reactions,
    reactionsNumber: reactions.length,
    shares: {
      sharePostId: 0,
    },
    postExtraContent: post.extraContent,
    postMediaUrl: post.mediaUrl,
    authorProfile,
    createdAt: post.created_at,
    subPostData,
  };
}

export function mapFeedPostsToPostData(
  posts: FeedPost[],
  replyAuthorsById: Map<string, FeedAuthor>,
  sharedPostsById: Map<string, FeedSharedPost> = EMPTY_SHARED_POSTS_BY_ID
): PostData[] {
  return posts.map((post) =>
    mapFeedPostToPostData(post, replyAuthorsById, sharedPostsById)
  );
}
