'use client'
import { useState } from "react"
import NavBar from "../components/NavBar"
import { storageData } from "../utils/StorageDataTypes"

const HomePage = (
    {data}: {data: storageData}
) => {
    const [navbarPage, setNavbarPage] = useState<number>(0)
    const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false)
    return (
        <div>
            <NavBar storageData={data} navbarPage={navbarPage} setNavbarPage={setNavbarPage} showMobileSearch={showMobileSearch} setShowMobileSearch={setShowMobileSearch}/>
        </div>
    )
}

export default HomePage