'use client';
import { useRouter } from 'next/navigation';
import '../../style.css';
import Navbar from '../../components/NavBar';
import ModaleNotificationMobileModale from '../../modali/ModaleNotificationMobileModale';
import MobileOptionFullScreenModal from '../../modali/MobileOptionFullScreenModal';
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks';
import { useEffect, useState } from 'react';
import { setNavbarPage } from '@/app/lib/slices/appStateSlice';
import BotProfileRenderer from '@/app/organisms/BotProfileRenderer';
import { persistor } from '@/app/lib/store'

const UserBotPage = () => {
  const [isHydrated, setIsHydrated] = useState(false)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isLogged = useAppSelector(state => state.userCredentials.userName.length > 0)
  const segments = pathname.split('/')
  const router = useRouter()
  const dispatch = useAppDispatch()

  const encodedName = segments[segments.length - 1]
  const userNameString = decodeURIComponent(encodedName)

  const userCredential = useAppSelector(state =>
    state.sessionGeneratedAccounts.acc.find(account => account.name === userNameString)
  )

  // Verifica se Redux-Persist ha idratato lo stato
  useEffect(() => {
    const checkPersistedState = async () => {
      const hasHydrated = await persistor.getState().bootstrapped;
      setIsHydrated(hasHydrated)
    };

    checkPersistedState()
  }, []);

  useEffect(() => {
    if (!isLogged) {
      router.push('/')
    }
  }, [isLogged, router])

  useEffect(() => {
    if (isHydrated && (userCredential || !isLogged)) {
      dispatch(setNavbarPage(20));
      console.log('Decoded User Name:', userNameString)
    }
  }, [dispatch, userCredential, isLogged, userNameString, isHydrated])

  if (!isHydrated) {
    return <div>Loading ...</div>
  }

  if (!isLogged) {
    return <div>Redirecting...</div>
  }

  return (
    <div id="container bg-danger">
      <ModaleNotificationMobileModale />
      <MobileOptionFullScreenModal />
      <Navbar />
      {userCredential ? (
        <BotProfileRenderer user={userCredential} />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default UserBotPage;
