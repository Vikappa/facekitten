import { CreateInitialCluster } from '@/app/utils/FakeAccountsClusterFactory/FakeAccountsClusterFactory';
import { CasualUser, Post, PostComment, UserDetails } from '@/app/utils/StorageDataTypes';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { use } from 'react';

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
          body: commentValue,
          commented_at: new Date().toISOString()
        });
      }
    },
    userLiked: (state, action: PayloadAction<{ post: Post }>) => {
      console.log('try user like');
      const { post } = action.payload;
    
      // Debug: verifica lo stato degli utenti generati
      console.log('Generated Accounts:', state.acc);
    
      const targetUser = state.acc.find(suser => suser.name === post.author.userName);
      if (!targetUser) {
        console.error(`User with name ${post.author.userName} not found`);
        return;
      }
    
      const targetPost = targetUser.posts.find(p => p.id === post.id);
      if (!targetPost) {
        console.error(`Post with id ${post.id} not found`);
        return;
      }
    
      targetPost.userliked = true;
      targetPost.likes++;
    },
    userDisliked: (state, action: PayloadAction<{ post: Post }>) => {
      const { post } = action.payload;
      const targetPost = state.acc.find(suser => suser.name === post.author.userName)?.posts.find(p => p.id === post.id);
      if (targetPost) {
        targetPost.userliked = false;
        targetPost.likes--;
      }
    },
    spreadOldPosts: (state, action: PayloadAction<Post[]>) => {
      const newPosts = action.payload;
      newPosts.forEach(newPost => {
        const targetUser = state.acc.find(suser => suser.name === newPost.author.userName);
        if (targetUser) {
          targetUser.posts.push(newPost);
        }
      })
    }
 },
  extraReducers: (builder) => {
    builder.addCase(initializeSessionGeneratedAccountSlice.fulfilled, (state, action) => {
      state.acc = action.payload;
    });
  }
});

export const { addCommentToPost, userLiked, userDisliked, spreadOldPosts } = userCredentialsSlice.actions;
export default userCredentialsSlice.reducer;
