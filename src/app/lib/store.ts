import { configureStore } from '@reduxjs/toolkit'
import userCredentialsSlice from './slices/userCrediantSlice'
import friendsSlice from './slices/friendsSlice'
import appStateSlice from './slices/appStateSlice'
import sessionGeneratedAccountsSlice from './slices/sessionGeneratedAccountsSlice'
import userPostsSlice from './slices/userPostsSlice'
import notificationSlice from './slices/notificationSlice'
import userChatsSlice from './slices/userChatsSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      userCredentials: userCredentialsSlice,
      friendList: friendsSlice,
      sessionGeneratedAccounts: sessionGeneratedAccountsSlice,
      status: appStateSlice,
      posts: userPostsSlice,
      notifications: notificationSlice,
      chats: userChatsSlice
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']