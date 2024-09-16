import { combineReducers } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage'; 
import { persistReducer } from 'redux-persist';
import userCredentialsSlice from './slices/userCrediantSlice'
import friendsSlice from './slices/friendsSlice'
import appStateSlice from './slices/appStateSlice'
import sessionGeneratedAccountsSlice from './slices/sessionGeneratedAccountsSlice'
import userPostsSlice from './slices/userPostsSlice'
import notificationSlice from './slices/notificationSlice'
import userChatsSlice from './slices/userChatsSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['userCredentials','friendList', 'sessionGeneratedAccounts', 'posts', 'chats'], 
};

const rootReducer = combineReducers({
    userCredentials: userCredentialsSlice,
    friendList: friendsSlice,
    sessionGeneratedAccounts: sessionGeneratedAccountsSlice,
    status: appStateSlice,
    posts: userPostsSlice,
    notifications: notificationSlice,
    chats: userChatsSlice});

export default persistReducer(persistConfig, rootReducer);
