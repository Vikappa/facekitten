import { createSlice } from '@reduxjs/toolkit';
import { UserData } from '../../interfaces/CommonInterfaces';
import { IPostComment } from '@/lib/db';

interface UserDataState {
  user: UserData | null;
}

const initialState: UserDataState = {
  user: null,
};

export const userDataSlice = createSlice({
  name: 'userData',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
    initializeUserData(state) {
      state.user = { username: '', avatarUrl: '', posts: [], bio: '', bannerUrl: '', following: [] };
    },
    addUserPost(state, action) {
      if (state.user?.posts) {
        state.user.posts.push(action.payload);
      } else {
        console.log("[USERDATASLICE]: Impossibile aggiungere post, utente non inizializzato")
      }
    },
    addCommentToUserPost(state, action) {
      const {
        id,
        postId,
        content,
        authorId,
        replies,
        replyCount,
        createdAt,
        commentAuthorPropic
      } = action.payload;

      const post = state.user?.posts.find(p => p.id === postId)
      if (!post) {
        console.error("NO POST FOUND IN USER REDUCER STATE")
        return
      }
      post.commentCount = 1 + (post.commentCount ? post.commentCount : 0)
      post.comments ??= []
      post.comments.push({
        id,
        postId,
        content,
        authorId,
        replies,
        replyCount,
        createdAt,
        commentAuthorPropic
      })
    },
    updateLikeToPost(state, action) {
      const postId = action.payload;
      const post = state.user?.posts.find(p => p.id === postId);
      if (!post) return;

      const newLiked = !post.liked;
      post.likeCount = Math.max(
        0,
        (post.likeCount ?? 0) + (newLiked ? 1 : -1)
      );
      post.liked = newLiked;
    },
    setCommentsToUserPost(state, action) {
      const { postId, comments } = action.payload;
      const post = state.user?.posts.find(p => p.id === postId);
      if (!post) return;
      post.comments = comments;
    }
  },
});

export const { setUser, clearUser, initializeUserData, addUserPost, addCommentToUserPost, updateLikeToPost, setCommentsToUserPost } = userDataSlice.actions;
export default userDataSlice.reducer;
