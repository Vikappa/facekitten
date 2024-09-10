'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from './lib/store'
import { initializeFriendsSlice } from './lib/slices/friendsSlice'
import { initializeAppGlobalStatus } from './lib/slices/appStateSlice'
import {initializeUserCredentialSlice} from './lib/slices/userCrediantSlice'
import { initializeNotification } from './lib/slices/notificationSlice'
import { initializeUserChatsSlice } from './lib/slices/userChatsSlice'

export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>()
  if (!storeRef.current) {
    storeRef.current = makeStore()

    storeRef.current.dispatch(initializeUserCredentialSlice({
      userName: '', profilepictureUrl: '',
      coverPhotoUrl: ''
    }))
    storeRef.current.dispatch(initializeFriendsSlice())
    storeRef.current.dispatch(initializeAppGlobalStatus(1))
    storeRef.current.dispatch(initializeNotification())
    storeRef.current.dispatch(initializeUserChatsSlice())
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
