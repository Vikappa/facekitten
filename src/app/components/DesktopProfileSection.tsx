import { useState } from "react";
import RoundGreyBorderLess from "../atoms/RoundActivableButton"
import { PiSquaresFourThin } from "react-icons/pi";
import { PiSquaresFourFill } from "react-icons/pi";
import { FaFacebookMessenger } from "react-icons/fa";
import { RiMessengerLine } from "react-icons/ri";
import { IoIosNotifications } from "react-icons/io";
import { IoIosNotificationsOutline } from "react-icons/io";

const DesktopProfileSection = ({selected, setSelected}: {selected: number; setSelected(selected:number): void}) => {

    const handleFirstButton = () => {
        if(selected === 5){
            setSelected(0)
        } else {
            setSelected(5)
        }
    }

    const handleSecondButton = () => {
        if(selected === 6){
            setSelected(0)
        } else {
            setSelected(6)
        }
    }
    const handleThirdButtonButton = () => {
        if(selected === 7){
            setSelected(0)
        } else {
            setSelected(7)
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
            selected={(selected === 7)} 
            onClick={handleThirdButtonButton}
            bgSelected="bg-quinary"
            bgNotSelected="bg-grayBg"
            size={30}
            />

        </div>
    )
}

export default DesktopProfileSection