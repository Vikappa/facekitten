import { createSlice } from '@reduxjs/toolkit';
import {UserData } from '../../interfaces/CommonInterfaces';

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
      state.user = { name: '', preferences: {} };
    }
  },
});

export const { setUser, clearUser, initializeUserData } = userDataSlice.actions;
export default userDataSlice.reducer;
