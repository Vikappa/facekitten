'use client'
import DesktopSearchbar from "./DesktopSearchbar"
import MobileSearchBar from "./MobileSearchBar"
import MidNavBar from "./MidNavBar"
import DesktopProfileSection from "./DesktopProfileSection"
import MobileProfileSection from "./MobileProfileSection"
import { useAppDispatch, useAppSelector, useAppStore } from "../lib/hooks"
import { setNavbarPage } from '../lib/slices/appStateSlice'
import MobileOptNavbar from "./MobileOptNavbar"
import { useEffect, useRef, useState } from "react"
const NavBar = () => {

    const notificationLength = useAppSelector(state => state.notifications.notifications.flatMap(notification => notification.seen));
        const [prevLength, setPrevLength] = useState(notificationLength.length);

        const audioRef1 = useRef<HTMLAudioElement>(null);
        const audioRef2 = useRef<HTMLAudioElement>(null);

        const dispatch = useAppDispatch();
        const navbarPage = useAppSelector(state => state.status.shownpage)

        const setNavbarPageOnClick = (page: number) => {
            dispatch(setNavbarPage(page));
        }

        useEffect(() => {
            if (notificationLength.length > prevLength) {
                audioRef1.current?.play();
            }
            setPrevLength(notificationLength.length);
        }, [notificationLength.length, prevLength]);

    return(
    <div className="d-flex flex-column justify-content-center align-items-center bg-white shadow-sm w-100">

    <div className="d-flex justify-content-between align-items-center bg-white shadow-sm p-1 px-3 w-100">
        <DesktopSearchbar/>
        <MobileSearchBar setSelected={setNavbarPage}/>

        <MidNavBar navbarPage={navbarPage} setNavbarPage={setNavbarPageOnClick}/>

        <DesktopProfileSection selected={navbarPage} setSelected={setNavbarPageOnClick} />
        <MobileProfileSection selected={navbarPage} setSelected={setNavbarPageOnClick}/>
    </div>

    <div className="d-sm-none">
        <MobileOptNavbar />
    </div>
    <audio ref={audioRef1} src="/assets/notificationEffect.m4a" />
    <audio ref={audioRef2} src="/assets/notificationEffect.m4a" />

    </div>

    )
}

export default NavBar