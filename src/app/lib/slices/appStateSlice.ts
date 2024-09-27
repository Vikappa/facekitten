import { Chat, UserDetails } from '@/app/utils/StorageDataTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppStatusState {
  shownpage: number;
  showMobileOptModal: boolean;
  showMobileSearch: boolean;
  showNotificationDropDown: boolean;
  showProfileDropDown: boolean;
  showNotificationModal: boolean;
  showMessengerDropDown: boolean;
}

const initialState: AppStatusState = {
  shownpage: 1,
  showMobileOptModal: false,
  showMobileSearch: false,
  showNotificationDropDown: false,
  showProfileDropDown: false,
  showNotificationModal:false,
  showMessengerDropDown: false,
}

const appStatusSlice = createSlice({
  name: 'appGlobalStatus',
  initialState,
  reducers: {
    setNavbarPage: (state, action: PayloadAction<number>) => {
      state.shownpage = action.payload;
    },
    initializeAppGlobalStatus: (state, action: PayloadAction<number>) => {
      state = initialState
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
     setShowProfileDropDown: (state, action: PayloadAction<boolean>) => {
      state.showProfileDropDown = action.payload;
     },
     setShowNotificationModal: (state, action: PayloadAction<boolean>) => {
      state.showNotificationModal = action.payload;
     },
     updateShowNotificationModal: (state) => {
      state.showNotificationModal = !state.showNotificationModal
     },
     updateShowMessengerDropDown: (state) => {
      state.showMessengerDropDown = !state.showMessengerDropDown
     },
     setShowMessengerDropDown: (state, action: PayloadAction<boolean>) => {
      state.showMessengerDropDown = action.payload;
     }
    }
});

export const { setNavbarPage, initializeAppGlobalStatus, 
  updateShowOptionsModal, hideOptionsModal, setShowMobileSearch, 
  setShowMobileSearchFalse, setShowDropDownNotification, setShowProfileDropDown,
  setShowNotificationModal, updateShowNotificationModal,
  updateShowMessengerDropDown, setShowMessengerDropDown } = appStatusSlice.actions;
export default appStatusSlice.reducer;
