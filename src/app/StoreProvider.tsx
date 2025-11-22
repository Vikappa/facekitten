'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/lib/store'
import { userDataSlice } from '@/lib/features/userData/userDataSlice'
import { profilesSlice } from '@/lib/features/profiles/profilesSlice'

export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore | null>(null)
  
  if (!storeRef.current) {
    storeRef.current = makeStore()
    storeRef.current.dispatch(userDataSlice.actions.initializeUserData())
    storeRef.current.dispatch(profilesSlice.actions.initializeProfiles())
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}