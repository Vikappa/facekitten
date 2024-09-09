import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppStatusState {
  shownpage: number;
  showMobileOptModal: boolean;
  showMobileSearch: boolean;
  showNotificationDropDown: boolean
}

const initialState: AppStatusState = {
  shownpage: 0,
  showMobileOptModal: false,
  showMobileSearch: false,
  showNotificationDropDown: false,
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
    updateShowOptionsModal: (state) => {
      state.showMobileOptModal = !state.showMobileOptModal
    },
    hideOptionsModal: (state) => {
      state.showMobileOptModal = false;
    },
    setShowMobileSearch: (state, action: PayloadAction<boolean>) => {
      state.showMobileSearch = action.payload;
    },
    setShowMobileSearchFalse: (state) => {
      state.showMobileSearch = false;
    },
    setShowDropDownNotification: (state, action: PayloadAction<boolean>) => {
      state.showNotificationDropDown = action.payload;
     },
    }
});

export const { setNavbarPage, initializeAppGlobalStatus, updateShowOptionsModal, hideOptionsModal, setShowMobileSearch, setShowMobileSearchFalse, setShowDropDownNotification } = appStatusSlice.actions;
export default appStatusSlice.reducer;
