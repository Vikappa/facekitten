'use client'
import RoundGreyBorderLess from "../atoms/RoundActivableButton"
import { PiSquaresFourThin } from "react-icons/pi";
import { PiSquaresFourFill } from "react-icons/pi";
import { FaFacebookMessenger } from "react-icons/fa";
import { RiMessengerLine } from "react-icons/ri";
import { IoIosNotifications } from "react-icons/io";
import { IoIosNotificationsOutline } from "react-icons/io";
import ProfileRoundButton from "../atoms/ProfileRoundButton";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { setShowDropDownNotification, setShowMessengerDropDown, setShowMobileSearch, setShowNotificationModal, setShowProfileDropDown, updateShowMessengerDropDown, updateShowOptionsModal } from "../lib/slices/appStateSlice";
import NotificationButton from "../atoms/NotificationButton";
import MessengerButton from "./MessengerButton";


const DesktopProfileSection = ({selected, setSelected}: {selected: number; setSelected(selected:number): void;}) => {

    const dispatch = useAppDispatch()
    const showNotificationDropDown = useAppSelector( state => state.status.showNotificationDropDown)
    const showProfileDropDown = useAppSelector (state => state.status.showNotificationDropDown)

    const handleFirstButton = () => {
        setSelected(8)
        dispatch(updateShowOptionsModal())
        dispatch(setShowNotificationModal(false))
        dispatch(setShowDropDownNotification(false))
        dispatch(setShowProfileDropDown(false))
        dispatch(setShowMobileSearch(false))
    }

    const handleSecondButton = () => {
        dispatch(setShowDropDownNotification(false))
        dispatch(setShowProfileDropDown(false))
        dispatch(updateShowMessengerDropDown())
    }
    
    const handleThirdButtonButton = () => {
        dispatch(setShowDropDownNotification(!showNotificationDropDown))
        dispatch(setShowProfileDropDown(false))
        dispatch(setShowNotificationModal(false))
        dispatch(setShowMessengerDropDown(false))
    }


    return(
        <div className="d-none d-sm-flex align-items-center p-0 m-0 gap-2 ">

            <RoundGreyBorderLess 
            iconSelected={<PiSquaresFourFill />} 
            iconUnselected={<PiSquaresFourThin/>} 
            selected={(selected === 8)} 
            onClick={handleFirstButton}
            bgSelected="bg-quinary"
            bgNotSelected="bg-grayBg"
            size={30}
            />

            <MessengerButton 
            onClick={handleSecondButton}
            />

            
            <NotificationButton 
            iconSelected={<IoIosNotifications/>} 
            iconUnselected={<IoIosNotificationsOutline  />} 
            onClick={handleThirdButtonButton}
            bgSelected="bg-quinary"
            bgNotSelected="bg-grayBg"
            size={30}
            />

            <ProfileRoundButton />

        </div>
    )
}

export default DesktopProfileSection