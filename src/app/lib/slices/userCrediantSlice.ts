import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface UserCredentialsState {
    userName:string;
    profilepictureUrl: string;
}

const initialState: UserCredentialsState = {
  userName: '',
  profilepictureUrl: ''
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
    initializeUserCredentialSlice: (state, action: PayloadAction<{ userName: string; profilepictureUrl: string }>) => {
      state.userName = action.payload.userName;
      state.profilepictureUrl = action.payload.profilepictureUrl;
    }
  },
});

export const { setUserNameState, setProfilepicture, initializeUserCredentialSlice } = userCredentialsSlice.actions;
export default userCredentialsSlice.reducer;
