import { configureStore } from '@reduxjs/toolkit'
import userDataReducer from './features/userData/userDataSlice'
import profilesSliceReducer from './features/profiles/profilesSlice'
import chatSlicesreducer from './features/chats/chatSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      userData: userDataReducer,
      profiles: profilesSliceReducer,
      chats: chatSlicesreducer
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']