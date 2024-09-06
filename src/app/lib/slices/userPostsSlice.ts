import { Post } from '@/app/utils/StorageDataTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface UserPostsState {
    userPosts: Post[];
}

const initialState: UserPostsState = {
    userPosts: [],

};

const userPostsSlice = createSlice({
  name: 'userPosts',
  initialState,
  reducers: {
    addPost:
    (state, action:PayloadAction<Post>) => {
      state.userPosts.push(action.payload)
    },
    deletePost:
    (state, action:PayloadAction<Post>) => {
      state.userPosts = state.userPosts.filter(post => post.id !== action.payload.id)
    },
    initializeUserCredentialSlice: (state) => {
      state.userPosts = []
    }
  },
});

export const { addPost, deletePost, initializeUserCredentialSlice } = userPostsSlice.actions;
export default userPostsSlice.reducer;
