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
    },
    randomCommentToUserPost: (state, action: PayloadAction<{ postNumber: number, commentAuthorDetails: UserDetails }>) => {
      const { postNumber, commentAuthorDetails } = action.payload;      
      const post = state.userPosts.find(userPost => userPost.id === postNumber);
  
      if (post) {
          const randomComment: PostComment = {
              id: post.comments.length+1,  
              author: commentAuthorDetails,
              body: FakePostTextFactory(),
              commented_at: new Date().toISOString()
          }

          post.comments.push(randomComment)

      } 
  }, addCommentToUserPost: (state, action: PayloadAction<{ postNumber: number, commentValue:string, commentAuthorDetails: UserDetails }>) => {
    const { postNumber, commentValue, commentAuthorDetails } = action.payload;      
    const post = state.userPosts.find(userPost => userPost.id === postNumber);

    if (post) {
        const randomComment: PostComment = {
            id: post.comments.length+1,  
            author: commentAuthorDetails,
            body: commentValue,
            commented_at: new Date().toISOString()
        }

        post.comments.push(randomComment)

    } 
  }
  },
});
export const { addPost, deletePost, initializeUserCredentialSlice,randomCommentToUserPost,addCommentToUserPost } = userPostsSlice.actions;
export default userPostsSlice.reducer;
