import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface UserCredentialsState {
    userName:string;
    profilepictureUrl: string;
    coverPhotoUrl: string;
}

const initialState: UserCredentialsState = {
  userName: '',
  profilepictureUrl: '',
  coverPhotoUrl: ''
};

const userCredentialsSlice = createSlice({
  name: 'userCredentials',
  initialState,
  reducers: {
    setUserNameState:
    (state, action:PayloadAction<string>) => {
      state.userName = action.payload
    },
    setProfilepicture:
    (state, action:PayloadAction<string>) => {
      state.profilepictureUrl = action.payload
    },
    setCoverPhotoUrl:
    (state, action:PayloadAction<string>) => {
      state.coverPhotoUrl = action.payload
    },
    initializeUserCredentialSlice: (state, action: PayloadAction<{ userName: string; profilepictureUrl: string; coverPhotoUrl:string }>) => {
      state.userName = action.payload.userName;
      state.profilepictureUrl = action.payload.profilepictureUrl;
      state.coverPhotoUrl = action.payload.coverPhotoUrl;
    }
  },
});

export const { setUserNameState, setProfilepicture, setCoverPhotoUrl, initializeUserCredentialSlice } = userCredentialsSlice.actions;
export default userCredentialsSlice.reducer;
