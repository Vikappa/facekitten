'use client'
import DesktopSearchbar from "./DesktopSearchbar"
import MobileSearchBar from "./MobileSearchBar"
import MidNavBar from "./MidNavBar"
import DesktopProfileSection from "./DesktopProfileSection"
import MobileProfileSection from "./MobileProfileSection"
import { storageData } from "../utils/StorageDataTypes"

const NavBar = (
    {navbarPage, setNavbarPage,showMobileSearch,setShowMobileSearch, storageData}: 
    {navbarPage:number; 
        setNavbarPage(navbarPage:number): void; 
        showMobileSearch:boolean; 
        setShowMobileSearch(mobileSearch:boolean):void
        storageData: storageData
    }) => {

    return(
    <div className="d-flex justify-content-between align-items-center bg-white shadow-sm p-1 px-3">
        <DesktopSearchbar/>
        <MobileSearchBar showMobileSearch={showMobileSearch} setShowMobileSearch={setShowMobileSearch} setSelected={setNavbarPage}/>

        <MidNavBar navbarPage={navbarPage} setNavbarPage={setNavbarPage}/>

        <DesktopProfileSection selected={navbarPage} setSelected={setNavbarPage} storageData={storageData}/>
        <MobileProfileSection showMobileSearch={showMobileSearch} setShowMobileSearch={setShowMobileSearch} selected={navbarPage} setSelected={setNavbarPage}/>
    </div>
    )
}

export default NavBar