'use client'
import { useState } from "react"
import NavBar from "../components/NavBar"
import MessengerPageOrg from "../organisms/MessengerPage"
import '../style.css'
const MessengerPage = () => {

    const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false)

    return(
    <>
      <NavBar />
      <MessengerPageOrg/>
      </>
    )
}

export default MessengerPage