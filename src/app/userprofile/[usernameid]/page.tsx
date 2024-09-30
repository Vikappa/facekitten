'use client'
import { useParams, useRouter } from 'next/navigation'
import '../../style.css'
import Navbar from "../../components/NavBar"
import ModaleNotificationMobileModale from "../../modali/ModaleNotificationMobileModale"
import MobileOptionFullScreenModal from '../../modali/MobileOptionFullScreenModal'
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks'
import { useEffect } from 'react'
import { setNavbarPage } from '@/app/lib/slices/appStateSlice'
import BotProfileRenderer from '@/app/organisms/BotProfileRenderer'

const UserBotPage = () => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isLogged = useAppSelector(state => state.userCredentials.userName.length > 0)    
    const segments = pathname.split('/')
    const router = useRouter()

    const encodedName = segments[segments.length - 1]
    
    const userNameString = decodeURIComponent(encodedName);

    const userCredential = useAppSelector(state => 
        state.sessionGeneratedAccounts.acc.find(account => account.name === userNameString)
    )

    useEffect(() => {
        if(!isLogged){
            router.push('/')
        }
    }, [isLogged])

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setNavbarPage(20))
        console.log(userNameString)
    }, [dispatch]);

    if (userCredential) {
        return (
            <div id="container bg-danger">
                <ModaleNotificationMobileModale />
                <MobileOptionFullScreenModal />
                <Navbar />
                <BotProfileRenderer user={userCredential} />
            </div>
        );
    }

}

export default UserBotPage
