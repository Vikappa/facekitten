import { createSlice } from '@reduxjs/toolkit';
import { UserData } from '../../interfaces/CommonInterfaces';

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
        state.user.posts = state.user.posts.concat(action.payload)
      } else {
       console.log("[USERDATASLICE]: Impossibile aggiungere post, utente non inizializzato") 
      }
    }
  },
});

export const { setUser, clearUser, initializeUserData, addUserPost } = userDataSlice.actions;
export default userDataSlice.reducer;
