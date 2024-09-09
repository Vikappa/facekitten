'use client'
import { useState } from "react"
import NavBar from "../components/NavBar"
import StoreMonitor from "../utils/StoreMonitorComponent"
import '../style.css';

const GamesPage = () => {

    const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false)


    return(
    <>
      <NavBar />
      <StoreMonitor/>
      </>
    )
}

export default GamesPage