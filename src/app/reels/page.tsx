'use client'
import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import StoreMonitor from "../utils/StoreMonitorComponent"
import '../style.css'
import VideoPageOrg from "../organisms/ViodePageOrg"
import { useAppDispatch, useAppSelector } from "../lib/hooks"
import { setNavbarPage, setShowNotificationModal } from "../lib/slices/appStateSlice"

const ReelPage = () => {

    const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false)
    const dispatch = useAppDispatch()
    const shownPage = useAppSelector(state => state.status.shownpage)

    useEffect(() => {
      if(shownPage !== 10) {
        setShowMobileSearch(false)
        dispatch(setShowNotificationModal(false))
        dispatch(setNavbarPage(10))
      }
    }, [])
    

    return(
    <>
      <NavBar />
      <div className="container">
        <VideoPageOrg/>
      </div>
      </>
    )
}

export default ReelPage