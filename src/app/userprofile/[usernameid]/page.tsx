'use client'
import { useParams } from 'next/navigation'
import '../../style.css'
import Navbar from "../../components/NavBar"
import ModaleNotificationMobileModale from "../../modali/ModaleNotificationMobileModale"
import MobileOptionFullScreenModal from '../../modali/MobileOptionFullScreenModal'
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks'
import { useEffect } from 'react'
import { setNavbarPage } from '@/app/lib/slices/appStateSlice'
import BotProfileRenderer from '@/app/organisms/BotProfileRenderer'

const UserBotPage = () => {
    const params = useParams()
    const usernameid = Array.isArray(params.usernameid) ? params.usernameid[0] : params.usernameid
    const userNameString = decodeURIComponent(usernameid || '')
    const userCredential = useAppSelector(state => state.sessionGeneratedAccounts.acc.find( account => account.name === userNameString))

    const dispatch = useAppDispatch()
    
    useEffect(() => {
        dispatch(setNavbarPage(20))
    }, [dispatch])

    if(userCredential){
        return (
            <div id="container bg-danger">
                <ModaleNotificationMobileModale />
                <MobileOptionFullScreenModal />
                <Navbar />
                <BotProfileRenderer user={userCredential} />
            </div>
        )
    }
}
export default UserBotPage
