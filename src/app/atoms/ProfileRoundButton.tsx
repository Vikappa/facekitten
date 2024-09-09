'use client'
import { Button } from "react-bootstrap"
import { useEffect, useState } from "react";
import RoundGreyBorderLess from "./RoundActivableButton";
import { FaChevronDown } from "react-icons/fa6";
import DeskTopProfileDropdown from "../components/DesktopProfileDropdown";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { setShowDropDownNotification, setShowProfileDropDown } from "../lib/slices/appStateSlice";

const ProfileRoundButton = () => {
        const dispatch = useAppDispatch()
        const showDropDown = useAppSelector(state => state.status.showProfileDropDown)
        const profilepictureUrl = useAppSelector(state => state.userCredentials.profilepictureUrl)

    const handleClick = () => {
        dispatch(setShowProfileDropDown(!showDropDown))
        dispatch(setShowDropDownNotification(false))
    }


    return (
        <div className="p-0 m-0 position-relative">
            <Button 
                onClick={handleClick}
                size="lg"
                className={`
                    border-0
                    d-flex justify-content-center align-items-center
                    rounded-circle
                    background
                    d-none d-sm-block        
                    fs-2
                `}
                style={{
                    backgroundImage: `url("${profilepictureUrl}")`,
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center', 
                    width: '40px', 
                    height: '40px', 
                    minWidth: '40px', 
                    minHeight: '40px', 
                    borderRadius: '50%',
                }}
            >
            </Button>
            <div 
                className="position-absolute top-0 right-0"
                style={{transform: 'translate(30%, 30%) scale(0.4)'}}
            >
                <RoundGreyBorderLess 
                    bgSelected={"bg-primary"} 
                    bgNotSelected={"bg-grayBg"} 
                    iconSelected={<FaChevronDown />} 
                    iconUnselected={<FaChevronDown />} 
                    selected={showDropDown}
                    onClick={handleClick} size={0}        
                />
            </div>
            <DeskTopProfileDropdown show={showDropDown} />
        </div>
    )
}

export default ProfileRoundButton;
