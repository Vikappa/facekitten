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
import { setShowDropDownNotification, setShowProfileDropDown } from "../lib/slices/appStateSlice";


const DesktopProfileSection = ({selected, setSelected}: {selected: number; setSelected(selected:number): void;}) => {

    const dispatch = useAppDispatch()
    const showNotificationDropDown = useAppSelector( state => state.status.showNotificationDropDown)
    const showProfileDropDown = useAppSelector (state => state.status.showNotificationDropDown)

    const handleFirstButton = () => {
        dispatch(setShowDropDownNotification(false))
        dispatch(setShowProfileDropDown(!showProfileDropDown))
        if(selected === 5){
            setSelected(0)
        } else {
            setSelected(5)
        }
    }

    const handleSecondButton = () => {
        dispatch(setShowDropDownNotification(false))
        dispatch(setShowProfileDropDown(false))
        if(selected === 6){
            setSelected(0)
        } else {
            setSelected(6)
        }
    }
    const handleThirdButtonButton = () => {
        dispatch(setShowDropDownNotification(!showNotificationDropDown))
        dispatch(setShowProfileDropDown(false))
    }

    const handleProfileButtonButton = () => {
        if(selected === 8){
            setSelected(0)
        } else {
            setSelected(8)
        }
    }

    return(
        <div className="d-none d-sm-flex align-items-center p-0 m-0 gap-2 ">

            <RoundGreyBorderLess 
            iconSelected={<PiSquaresFourFill />} 
            iconUnselected={<PiSquaresFourThin/>} 
            selected={(selected === 5)} 
            onClick={handleFirstButton}
            bgSelected="bg-quinary"
            bgNotSelected="bg-grayBg"
            size={30}
            />

            <RoundGreyBorderLess 
            iconSelected={<FaFacebookMessenger/>} 
            iconUnselected={<RiMessengerLine />} 
            selected={(selected === 6)} 
            onClick={handleSecondButton}
            bgSelected="bg-quinary"
            bgNotSelected="bg-grayBg"
            size={30}
            />

            
            <RoundGreyBorderLess 
            iconSelected={<IoIosNotifications/>} 
            iconUnselected={<IoIosNotificationsOutline  />} 
            selected={showNotificationDropDown} 
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