'use client'
import { IoHomeOutline } from "react-icons/io5";
import { IoHomeSharp } from "react-icons/io5";
import { useRouter } from "next/navigation"
import MobileOptSquaredButton from "../atoms/MobileOptSquaredButton"
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { setNavbarPage, setShowDropDownNotification, setShowNotificationModal, updateShowNotificationModal } from "../lib/slices/appStateSlice";
import { FaShop } from "react-icons/fa6";
import { HiOutlineUsers } from "react-icons/hi2";
import { HiUsers } from "react-icons/hi2";
import { RiMessengerFill } from "react-icons/ri";
import { RiMessengerLine } from "react-icons/ri";
import { PiVideoFill } from "react-icons/pi";
import { PiVideoLight } from "react-icons/pi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoMdNotifications } from "react-icons/io";
import NotificationRedDotMobileVersion from "../atoms/NotificationRedDotMobileVersion";

const MobileOptNavbar = () => {
    const dispatch = useAppDispatch()
    const currentNavbarPage = useAppSelector(state => state.status.shownpage)
    const router = useRouter()
    const showNotificationDropDown = useAppSelector(state => state.status.showNotificationModal)

    const setPage1 = () => {
        router.push('/')
        dispatch(setNavbarPage(1))
        dispatch(setShowNotificationModal(false))
    }
    const setPage2 = () => {
        router.push('/marketplace')
        dispatch(setNavbarPage(2))
        dispatch(setShowNotificationModal(false))
    }
    const setPage3 = () => {
        router.push('/amici')
       dispatch(setNavbarPage(3))
       dispatch(setShowNotificationModal(false))
    }
    const setPage10 = () => {
        router.push('/reels')
       dispatch(setNavbarPage(10))
       dispatch(setShowNotificationModal(false))
    }
    const setPage9 = () => {
        router.push('/messenger')
       dispatch(setNavbarPage(9))
       dispatch(setShowNotificationModal(false))
    }

    return (
        <div className="w-100 d-flex justify-content-evenly gap-2 position-relative">
            {/* casa */}
            <MobileOptSquaredButton iconSelected={<IoHomeSharp />} iconUnselected={<IoHomeOutline />} selected={(currentNavbarPage===1)} onClick={setPage1} size={0} />
            {/* amici */}
            <MobileOptSquaredButton iconSelected={<HiUsers />} iconUnselected={<HiOutlineUsers />} selected={(currentNavbarPage===3)} onClick={setPage3} size={0} />
            {/* messenger */}
            <MobileOptSquaredButton iconSelected={<RiMessengerFill />} iconUnselected={<RiMessengerLine />} selected={(currentNavbarPage===9)} onClick={setPage9} size={0} />
            {/* video */}
            <MobileOptSquaredButton iconSelected={<PiVideoFill />} iconUnselected={<PiVideoLight />} selected={(currentNavbarPage===10)} onClick={setPage10} size={0} />
            {/* notification */}
            <div className="position-relative p-0 m-0">
            <MobileOptSquaredButton iconSelected={<IoMdNotifications />} iconUnselected={<IoIosNotificationsOutline />} selected={showNotificationDropDown} onClick={function (): void {
                dispatch(setShowDropDownNotification(false))
                dispatch(updateShowNotificationModal())
            } } size={0} />
            <NotificationRedDotMobileVersion/>
            </div>
            {/* marketplaceOutline */}
            <MobileOptSquaredButton iconSelected={<FaShop />} iconUnselected={<FaShop />} selected={(currentNavbarPage===2)} onClick={setPage2} size={0} />
        </div>
    )
}

export default MobileOptNavbar