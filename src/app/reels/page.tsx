'use client'
import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import StoreMonitor from "../utils/StoreMonitorComponent"
import '../style.css'
import VideoPageOrg from "../organisms/ViodePageOrg"
import { useAppDispatch, useAppSelector } from "../lib/hooks"
import { setNavbarPage, setShowNotificationModal } from "../lib/slices/appStateSlice"
import { useRouter } from "next/navigation"
import MobileOptionFullScreenModal from "../modali/MobileOptionFullScreenModal"

const ReelPage = () => {

    const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false)
    const dispatch = useAppDispatch()
    const shownPage = useAppSelector(state => state.status.shownpage)
    const isLoggeId = useAppSelector(state => state.userCredentials.userName.length > 0)
    const router = useRouter()

    useEffect(() => {
      if(shownPage !== 10) {
        setShowMobileSearch(false)
        dispatch(setShowNotificationModal(false))
        dispatch(setNavbarPage(10))
      }

      if(!isLoggeId){
        router.push('/') 
      }
    }, [])
    

    return(
    <>
    <div className="p-0 m-0 top-0 w-100 d-none d-md-block sticky-top">
      <NavBar />
    </div>
      <div className="container-fluid p-0">
        <MobileOptionFullScreenModal/>
        <VideoPageOrg/>
      </div>
      </>
    )
}

export default ReelPage