import { configureStore } from '@reduxjs/toolkit'
import userCredentialsSlice from './slices/userCrediantSlice'
import friendsSlice from './slices/friendsSlice'
import appStateSlice from './slices/appStateSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      userCredentials: userCredentialsSlice,
      friendList: friendsSlice,
      status: appStateSlice
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']