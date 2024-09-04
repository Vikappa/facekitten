import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppStatusState {
  shownpage: number;
}

const initialState: AppStatusState = {
  shownpage: 0,
};

const appStatusSlice = createSlice({
  name: 'appGlobalStatus',
  initialState,
  reducers: {
    setNavbarPage: (state, action: PayloadAction<number>) => {
      state.shownpage = action.payload;
    },
    initializeAppGlobalStatus: (state, action: PayloadAction<number>) => {
      state.shownpage = action.payload;
    },
  },
});

export const { setNavbarPage, initializeAppGlobalStatus } = appStatusSlice.actions;
export default appStatusSlice.reducer;
