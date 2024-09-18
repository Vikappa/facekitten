import { Post, PostComment } from '@/app/utils/StorageDataTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserDetails } from "@/app/utils/StorageDataTypes"
import { FakePostTextFactory } from '@/app/utils/FakePostFactory/FakePostFactory';


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
    addPost: (state, action: PayloadAction<Post>) => {
      state.userPosts.push(action.payload);
    },
    deletePost: (state, action: PayloadAction<Post>) => {
      state.userPosts = state.userPosts.filter(post => post.id !== action.payload.id);
    },
    initializeUserCredentialSlice: (state) => {
      state.userPosts = [];
    },
    randomCommentToUserPost: (state, action: PayloadAction<{ postNumber: number, commentAuthorDetails: UserDetails }>) => {
      const { postNumber, commentAuthorDetails } = action.payload;      
      const post = state.userPosts.find(userPost => userPost.id === postNumber);
  
      if (post) {
          const randomComment: PostComment = {
              id: post.comments.length + 1,  
              author: commentAuthorDetails,
              body: FakePostTextFactory().normalPostTex,
              commented_at: new Date().toISOString()
          };

          post.comments.push(randomComment);
      } 
    },
    addCommentToUserPost: (state, action: PayloadAction<{ postNumber: number, commentValue: string, commentAuthorDetails: UserDetails }>) => {
      const { postNumber, commentValue, commentAuthorDetails } = action.payload;      
      const post = state.userPosts.find(userPost => userPost.id === postNumber);

      if (post) {
          const randomComment: PostComment = {
              id: post.comments.length + 1,  
              author: commentAuthorDetails,
              body: commentValue,
              commented_at: new Date().toISOString()
          };

          post.comments.push(randomComment);
      } 
    },
    likeToUserPost: (state, action: PayloadAction<{usePost: Post}>) => {
      const userPost = state.userPosts.find(userPost => userPost.id === action.payload.usePost.id);
      if (userPost) {
        userPost.userliked = true;
        userPost.likes++;
      }
    },
    dislikeToUserPost: (state, action: PayloadAction<{userPost: Post}>) => {
      const userPost = state.userPosts.find(userPost => userPost.id === action.payload.userPost.id);
      if (userPost) {
        userPost.userliked = false;
        userPost.likes--;
      }
    },
    botLikedUserPost: (state, action: PayloadAction<{userPost: Post, botCredentials: UserDetails}>) => {
      const userPost = state.userPosts.find(userPost => userPost.id === action.payload.userPost.id);
      if (userPost) {
        userPost.likes++;
        userPost.likeProfiles.push(action.payload.botCredentials);
      }
    },
    botDislikedUserPost : (state, action: PayloadAction<{userPost: Post, botCredentials: UserDetails}>) => {
      const userPost = state.userPosts.find(userPost => userPost.id === action.payload.userPost.id);
      if (userPost) {
        userPost.likes--;
        userPost.likeProfiles = userPost.likeProfiles.filter(likeProfile => likeProfile.userName !== action.payload.botCredentials.userName);
      }
    }
  },
});export const { addPost, deletePost, initializeUserCredentialSlice,randomCommentToUserPost,addCommentToUserPost,
  likeToUserPost, dislikeToUserPost, botLikedUserPost, botDislikedUserPost
 } = userPostsSlice.actions;
export default userPostsSlice.reducer;
