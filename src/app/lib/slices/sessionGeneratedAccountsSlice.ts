import { CreateInitialCluster } from '@/app/utils/FakeAccountsClusterFactory/FakeAccountsClusterFactory';
import { FakeTextPostFactory, fetchRandomPostFoto } from '@/app/utils/FakePostFactory/FakePostFactory';
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
          body: commentValue,
          commented_at: new Date().toISOString()
        });
      }
    },
    addPostToAccount: (state, action: PayloadAction<{editedAccount:CasualUser}>) => {
      const account = state.acc.find(user => user.name === action.payload.editedAccount.name);
      const randomAuthor = state.acc[Math.floor(Math.random() * state.acc.length)]
      const imgPossibility = Math.round(Math.random() * 100)
      if(account){
      const newRandomPost: Post = {
        id: account?.posts.length,
        author: {
          userName: randomAuthor.name,
          profilepicture: randomAuthor.profilePic
        },
        body: FakeTextPostFactory(),
        image: imgPossibility < 20 ? '' : '',
        comments: [],
        created_at: new Date().toISOString(),
        likes: Math.floor(Math.random() * 10)
      }
      account.posts = [...account.posts, newRandomPost];
    }
    },
    randomCommentsOnExistingPost: (state, action: PayloadAction<{editedAccount:CasualUser, editedPost:Post}>) => {
      const { editedAccount, editedPost } = action.payload;
      const targetAccount = state.acc.find(user => user.name === editedAccount.name);
      if (targetAccount) {
        const randomAuthor = state.acc[Math.floor(Math.random() * state.acc.length)]
        const imgPossibility = Math.round(Math.random() * 100)
        const newRandomComment: PostComment = {
          id: targetAccount.posts.length,
          author: {
            userName: randomAuthor.name,
            profilepicture: randomAuthor.profilePic
          },
          body: FakeTextPostFactory(),
          commented_at: new Date().toISOString()
        }
        const targetPost = targetAccount.posts.find(p => p.id === editedPost.id);

      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(initializeSessionGeneratedAccountSlice.fulfilled, (state, action) => {
      state.acc = action.payload;
    });
  }
});

export const { addCommentToPost, addPostToAccount, randomCommentsOnExistingPost } = userCredentialsSlice.actions;
export default userCredentialsSlice.reducer;
