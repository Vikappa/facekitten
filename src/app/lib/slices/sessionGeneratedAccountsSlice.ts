import { CreateInitialCluster } from '@/app/utils/FakeAccountsClusterFactory/FakeAccountsClusterFactory';
import { CasualUser, Post, PostComment, UserDetails } from '@/app/utils/StorageDataTypes';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface sessionGeneratedAccountsState {
    acc: CasualUser[];
}

const initialState: sessionGeneratedAccountsState = {
    acc: []
};

export const initializeSessionGeneratedAccountSlice = createAsyncThunk(
  'sessionGeneratedAccounts/initialize',
  async () => {
    const data = await CreateInitialCluster();
    return data;
  }
);

const userCredentialsSlice = createSlice({
  name: 'sessionGeneratedAccounts',
  initialState,
  reducers: {
    addCommentToPost: (
      state,
      action: PayloadAction<{ post: Post, commentValue: string, author: UserDetails }>
    ) => {
      const { post, commentValue, author } = action.payload;
      const targetPost = state.acc.find(user => user.name === post.author.userName)?.posts.find(p => p.id === post.id);
      if (targetPost) {
        targetPost.comments = targetPost.comments || [];
        targetPost.comments.push({
          id: targetPost.comments.length + 1,
          author: author,
          body: commentValue
        });
      }
    } 
 },
  extraReducers: (builder) => {
    builder.addCase(initializeSessionGeneratedAccountSlice.fulfilled, (state, action) => {
      state.acc = action.payload;
    });
  }
});

export const { addCommentToPost } = userCredentialsSlice.actions;
export default userCredentialsSlice.reducer;
