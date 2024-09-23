'use client'
import { useParams } from 'next/navigation'
import '../../style.css'
import Navbar from "../../components/NavBar"
import ModaleNotificationMobileModale from "../../modali/ModaleNotificationMobileModale"
import UserProfileRenderer from "../../organisms/UserProfileRenderer"
import MobileOptionFullScreenModal from '../../modali/MobileOptionFullScreenModal'
import { useAppDispatch } from '@/app/lib/hooks'
import { useEffect } from 'react'
import { setNavbarPage } from '@/app/lib/slices/appStateSlice'

const UserBotPage = () => {
    const params = useParams()
    const usernameid = Array.isArray(params.usernameid) ? params.usernameid[0] : params.usernameid
    const userNameString = decodeURIComponent(usernameid || '')

    const dispatch = useAppDispatch()
    
    useEffect(() => {
        dispatch(setNavbarPage(20))
    }, [dispatch])
    

    return (
        <div id="container bg-danger">
            <ModaleNotificationMobileModale />
            <MobileOptionFullScreenModal />
            <Navbar />
            <h1>Profilo utente: {userNameString}</h1> 
        </div>
    )
}
export default UserBotPage
