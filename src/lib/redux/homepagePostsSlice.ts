import {
    CommentData,
    CommentReplyData,
    PostData,
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
    CommentId: string;
    CommentReplyData: CommentReplyData;
}

export interface ReplaceCommentReplyReduxPayload {
    CommentId: string;
    TempCommentReplyId: string;
    CommentReplyData: CommentReplyData;
}

export interface RemoveCommentReplyReduxPayload {
    CommentId: string;
    CommentReplyId: string;
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
            for (const post of state.posts) {
                const targetComment = post.comments.find(
                    (comment) => comment.commentId === action.payload.CommentId
                );

                if (!targetComment) {
                    continue;
                }

                targetComment.commentReplies.push(action.payload.CommentReplyData);
                targetComment.commentRepliesCount = targetComment.commentReplies.length;
                return;
            }
        },
        replaceCommentReplyInComment(
            state,
            action: PayloadAction<ReplaceCommentReplyReduxPayload>
        ) {
            for (const post of state.posts) {
                const targetComment = post.comments.find(
                    (comment) => comment.commentId === action.payload.CommentId
                );

                if (!targetComment) {
                    continue;
                }

                const targetReplyIndex = targetComment.commentReplies.findIndex(
                    (reply) => reply.commentReplyId === action.payload.TempCommentReplyId
                );

                if (targetReplyIndex >= 0) {
                    targetComment.commentReplies[targetReplyIndex] = action.payload.CommentReplyData;
                } else {
                    targetComment.commentReplies.push(action.payload.CommentReplyData);
                }

                targetComment.commentRepliesCount = targetComment.commentReplies.length;
                return;
            }
        },
        removeCommentReplyFromComment(
            state,
            action: PayloadAction<RemoveCommentReplyReduxPayload>
        ) {
            for (const post of state.posts) {
                const targetComment = post.comments.find(
                    (comment) => comment.commentId === action.payload.CommentId
                );

                if (!targetComment) {
                    continue;
                }

                targetComment.commentReplies = targetComment.commentReplies.filter(
                    (reply) => reply.commentReplyId !== action.payload.CommentReplyId
                );
                targetComment.commentRepliesCount = targetComment.commentReplies.length;
                return;
            }
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
} = homepagePostsSlice.actions;
export default homepagePostsSlice.reducer;
