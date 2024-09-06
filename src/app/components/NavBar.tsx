'use client'
import DesktopSearchbar from "./DesktopSearchbar"
import MobileSearchBar from "./MobileSearchBar"
import MidNavBar from "./MidNavBar"
import DesktopProfileSection from "./DesktopProfileSection"
import MobileProfileSection from "./MobileProfileSection"
import { useAppDispatch, useAppSelector, useAppStore } from "../lib/hooks"
import { setNavbarPage } from '../lib/slices/appStateSlice'
const NavBar = () => {

        const dispatch = useAppDispatch();

        const setNavbarPageOnClick = (page: number) => {
            dispatch(setNavbarPage(page));
        }
        

        const navbarPage = useAppSelector(state => state.status.shownpage)

    return(
    <div className="d-flex justify-content-between align-items-center bg-white shadow-sm p-1 px-3">
        <DesktopSearchbar/>
        <MobileSearchBar setSelected={setNavbarPage}/>

        <MidNavBar navbarPage={navbarPage} setNavbarPage={setNavbarPageOnClick}/>

        <DesktopProfileSection selected={navbarPage} setSelected={setNavbarPageOnClick} />
        <MobileProfileSection selected={navbarPage} setSelected={setNavbarPageOnClick}/>
    </div>
    )
}

export default NavBar