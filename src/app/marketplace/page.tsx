'use client'
import { useState } from "react"
import NavBar from "../components/NavBar"
import StoreMonitor from "../utils/StoreMonitorComponent"

const MarketplacePage = () => {

    const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false)


    return(
    <>
      <NavBar showMobileSearch={showMobileSearch} setShowMobileSearch={setShowMobileSearch}/>
      <StoreMonitor/>
      </>
    )
}

export default MarketplacePage