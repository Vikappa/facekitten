import { PostData } from "@/lib/interfaces/CommonInterfaces";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface HomepagePostsState {
    posts: PostData[];
    lastUpdatedAt: number | null;
}

export const initialHomepagePostsState: HomepagePostsState = {
    posts: [],
    lastUpdatedAt: null,
};

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
    },
});

export const { setHomepagePosts, prependHomepagePost, prependHomepagePosts, hydrateHomepagePostsState, clearHomepagePosts } = homepagePostsSlice.actions;
export default homepagePostsSlice.reducer;
