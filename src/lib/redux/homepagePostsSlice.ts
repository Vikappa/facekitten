import {
    CommentData,
    CommentReplyData,
    PostData,
    ReactionData,
} from "@/lib/interfaces/CommonInterfaces";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface HomepagePostsState {
    posts: PostData[];
    lastUpdatedAt: number | null;
}

export const initialHomepagePostsState: HomepagePostsState = {
    posts: [],
    lastUpdatedAt: null,
};

export interface AddCommentReduxPayload{
    CommentData :CommentData;
    PostId: string;
}

export interface AddCommentReplyReduxPayload {
    PostId?: string;
    CommentId: string;
    CommentReplyData: CommentReplyData;
}

export interface ReplaceCommentReplyReduxPayload {
    PostId?: string;
    CommentId: string;
    TempCommentReplyId: string;
    CommentReplyData: CommentReplyData;
}

export interface RemoveCommentReplyReduxPayload {
    PostId?: string;
    CommentId: string;
    CommentReplyId: string;
}

type ReactionTargetType = "post" | "comment" | "commentReply";

export interface UpsertReactionInHomepagePayload {
    targetType: ReactionTargetType;
    targetId: string;
    reaction: ReactionData;
}

export interface RemoveReactionFromHomepagePayload {
    targetType: ReactionTargetType;
    targetId: string;
    authorId?: string;
    reactionId?: string;
}

function findCommentById(posts: PostData[], commentId: string): CommentData | undefined {
    for (const post of posts) {
        const comment = post.comments.find((candidate) => candidate.commentId === commentId);
        if (comment) {
            return comment;
        }
    }

    return undefined;
}

function findCommentByScope(
    posts: PostData[],
    payload: { PostId?: string; CommentId: string }
): CommentData | undefined {
    const normalizedCommentId = payload.CommentId.trim();
    if (normalizedCommentId.length === 0) {
        return undefined;
    }

    const normalizedPostId = (payload.PostId ?? "").trim();
    if (normalizedPostId.length > 0) {
        const targetPost = posts.find((post) => post.postId === normalizedPostId);
        if (!targetPost) {
            return undefined;
        }

        return targetPost.comments.find((comment) => comment.commentId === normalizedCommentId);
    }

    return findCommentById(posts, normalizedCommentId);
}

function findCommentReplyById(posts: PostData[], commentReplyId: string): CommentReplyData | undefined {
    for (const post of posts) {
        for (const comment of post.comments) {
            const reply = comment.commentReplies.find(
                (candidate) => candidate.commentReplyId === commentReplyId
            );
            if (reply) {
                return reply;
            }
        }
    }

    return undefined;
}

function findReactionIndexByAuthorId(reactions: ReactionData[], authorId: string): number {
    return reactions.findIndex((reaction) => reaction.authorId === authorId);
}

const homepagePostsSlice = createSlice({
    name: "homepagePosts",
    initialState: initialHomepagePostsState,
    reducers: {
        setHomepagePosts(state, action: PayloadAction<PostData[]>) {
            state.posts = action.payload;
            state.lastUpdatedAt = Date.now();
        },
        prependHomepagePost(state, action: PayloadAction<PostData>) {
            state.posts = state.posts.filter((post) => post.postId !== action.payload.postId);
            state.posts.unshift(action.payload);
            state.lastUpdatedAt = Date.now();
        },
        prependHomepagePosts(state, action: PayloadAction<PostData[]>) {
        const incomingIds = new Set(action.payload.map((p) => p.postId));
        state.posts = [
            ...action.payload,
            ...state.posts.filter((p) => !incomingIds.has(p.postId)),
        ];
        state.lastUpdatedAt = Date.now();
        },
        hydrateHomepagePostsState(state, action: PayloadAction<HomepagePostsState>) {
            state.posts = action.payload.posts;
            state.lastUpdatedAt = action.payload.lastUpdatedAt;
        },
        clearHomepagePosts(state) {
            state.posts = [];
            state.lastUpdatedAt = null;
        },
        addCommentToPost(state, action: PayloadAction<AddCommentReduxPayload>){
            const target = state.posts.find(p => p.postId === action.payload.PostId)
            if (target) {
                target.comments.push(action.payload.CommentData)
                target.commentNumber = target.comments.length
            }
        },
        addCommentReplyToComment(state, action: PayloadAction<AddCommentReplyReduxPayload>) {
            const targetComment = findCommentByScope(state.posts, action.payload);
            if (!targetComment) {
                return;
            }

            targetComment.commentReplies.push(action.payload.CommentReplyData);
            targetComment.commentRepliesCount = targetComment.commentReplies.length;
        },
        replaceCommentReplyInComment(
            state,
            action: PayloadAction<ReplaceCommentReplyReduxPayload>
        ) {
            const targetComment = findCommentByScope(state.posts, action.payload);
            if (!targetComment) {
                return;
            }

            const normalizedTempReplyId = action.payload.TempCommentReplyId.trim();
            const normalizedFinalReplyId = (
                action.payload.CommentReplyData.commentReplyId ?? ""
            ).trim();

            const tempReplyIndex =
                normalizedTempReplyId.length > 0
                    ? targetComment.commentReplies.findIndex(
                        (reply) => reply.commentReplyId === normalizedTempReplyId
                    )
                    : -1;

            if (tempReplyIndex >= 0) {
                targetComment.commentReplies[tempReplyIndex] = action.payload.CommentReplyData;
                targetComment.commentRepliesCount = targetComment.commentReplies.length;
                return;
            }

            const definitiveReplyIndex =
                normalizedFinalReplyId.length > 0
                    ? targetComment.commentReplies.findIndex(
                        (reply) => (reply.commentReplyId ?? "").trim() === normalizedFinalReplyId
                    )
                    : -1;

            if (definitiveReplyIndex >= 0) {
                targetComment.commentReplies[definitiveReplyIndex] = action.payload.CommentReplyData;
                targetComment.commentRepliesCount = targetComment.commentReplies.length;
                return;
            }

            targetComment.commentReplies.push(action.payload.CommentReplyData);
            targetComment.commentRepliesCount = targetComment.commentReplies.length;
        },
        removeCommentReplyFromComment(
            state,
            action: PayloadAction<RemoveCommentReplyReduxPayload>
        ) {
            const targetComment = findCommentByScope(state.posts, action.payload);
            if (!targetComment) {
                return;
            }

            const normalizedCommentReplyId = action.payload.CommentReplyId.trim();
            if (normalizedCommentReplyId.length === 0) {
                return;
            }

            targetComment.commentReplies = targetComment.commentReplies.filter(
                (reply) => (reply.commentReplyId ?? "").trim() !== normalizedCommentReplyId
            );
            targetComment.commentRepliesCount = targetComment.commentReplies.length;
        },
        upsertReactionInHomepagePosts(
            state,
            action: PayloadAction<UpsertReactionInHomepagePayload>
        ) {
            const { targetType, targetId, reaction } = action.payload;
            const normalizedTargetId = targetId.trim();
            if (normalizedTargetId.length === 0) {
                return;
            }

            if (targetType === "post") {
                const targetPost = state.posts.find((post) => post.postId === normalizedTargetId);
                if (!targetPost) {
                    return;
                }

                const reactionAuthorId = reaction.authorId ?? null;
                const existingReactionIndex =
                    reactionAuthorId
                        ? findReactionIndexByAuthorId(targetPost.reactions, reactionAuthorId)
                        : targetPost.reactions.findIndex(
                            (candidate) => candidate.reactionId === reaction.reactionId
                        );

                if (existingReactionIndex >= 0) {
                    targetPost.reactions[existingReactionIndex] = reaction;
                } else {
                    targetPost.reactions.push(reaction);
                }

                targetPost.reactionsNumber = targetPost.reactions.length;
                return;
            }

            if (targetType === "comment") {
                const targetComment = findCommentById(state.posts, normalizedTargetId);
                if (!targetComment) {
                    return;
                }

                const reactionAuthorId = reaction.authorId ?? null;
                const existingReactionIndex =
                    reactionAuthorId
                        ? findReactionIndexByAuthorId(targetComment.reactions, reactionAuthorId)
                        : targetComment.reactions.findIndex(
                            (candidate) => candidate.reactionId === reaction.reactionId
                        );

                if (existingReactionIndex >= 0) {
                    targetComment.reactions[existingReactionIndex] = reaction;
                } else {
                    targetComment.reactions.push(reaction);
                }

                targetComment.reactionNumbers = targetComment.reactions.length;
                return;
            }

            const targetReply = findCommentReplyById(state.posts, normalizedTargetId);
            if (!targetReply) {
                return;
            }

            const reactionAuthorId = reaction.authorId ?? null;
            const existingReactionIndex =
                reactionAuthorId
                    ? findReactionIndexByAuthorId(targetReply.commentReplyReactions, reactionAuthorId)
                    : targetReply.commentReplyReactions.findIndex(
                        (candidate) => candidate.reactionId === reaction.reactionId
                    );

            if (existingReactionIndex >= 0) {
                targetReply.commentReplyReactions[existingReactionIndex] = reaction;
            } else {
                targetReply.commentReplyReactions.push(reaction);
            }
        },
        removeReactionFromHomepagePosts(
            state,
            action: PayloadAction<RemoveReactionFromHomepagePayload>
        ) {
            const { targetType, targetId, authorId, reactionId } = action.payload;
            const normalizedTargetId = targetId.trim();
            const normalizedAuthorId = (authorId ?? "").trim();
            const normalizedReactionId = (reactionId ?? "").trim();

            if (
                normalizedTargetId.length === 0 ||
                (normalizedAuthorId.length === 0 && normalizedReactionId.length === 0)
            ) {
                return;
            }

            if (targetType === "post") {
                const targetPost = state.posts.find((post) => post.postId === normalizedTargetId);
                if (!targetPost) {
                    return;
                }

                targetPost.reactions = targetPost.reactions.filter(
                    (reaction) =>
                        (normalizedAuthorId.length > 0 && reaction.authorId !== normalizedAuthorId) ||
                        (normalizedAuthorId.length === 0 && reaction.reactionId !== normalizedReactionId)
                );
                targetPost.reactionsNumber = targetPost.reactions.length;
                return;
            }

            if (targetType === "comment") {
                const targetComment = findCommentById(state.posts, normalizedTargetId);
                if (!targetComment) {
                    return;
                }

                targetComment.reactions = targetComment.reactions.filter(
                    (reaction) =>
                        (normalizedAuthorId.length > 0 && reaction.authorId !== normalizedAuthorId) ||
                        (normalizedAuthorId.length === 0 && reaction.reactionId !== normalizedReactionId)
                );
                targetComment.reactionNumbers = targetComment.reactions.length;
                return;
            }

            const targetReply = findCommentReplyById(state.posts, normalizedTargetId);
            if (!targetReply) {
                return;
            }

            targetReply.commentReplyReactions = targetReply.commentReplyReactions.filter(
                (reaction) =>
                    (normalizedAuthorId.length > 0 && reaction.authorId !== normalizedAuthorId) ||
                    (normalizedAuthorId.length === 0 && reaction.reactionId !== normalizedReactionId)
            );
        }
    },
});

export const {
    setHomepagePosts,
    prependHomepagePost,
    prependHomepagePosts,
    hydrateHomepagePostsState,
    clearHomepagePosts,
    addCommentToPost,
    addCommentReplyToComment,
    replaceCommentReplyInComment,
    removeCommentReplyFromComment,
    upsertReactionInHomepagePosts,
    removeReactionFromHomepagePosts,
} = homepagePostsSlice.actions;
export default homepagePostsSlice.reducer;
