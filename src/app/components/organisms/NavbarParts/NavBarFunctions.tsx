'use client'

import NavbarButtonFunction, { ProfilePicture } from "../../atoms/NavbarFunctionButton";
import { PiSquaresFourFill } from "react-icons/pi";
import { FaFacebookMessenger } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { useState } from "react";

export default function NavbarFunctions(){

    const navbarbuttonsClassName = "bg-tertiary text-dark-400 p-2 md:px-2 rounded-full transition-colors duration-100";
    const profileButtonClassName = "rounded-full overflow-hidden";
    const [activeNavFunction, setActiveNavFunction] = useState<null | "squares" | "messenger" | "bell" | "profile">(null);
    const isSquaresButtonActive = activeNavFunction === "squares";
    const isMessengerButtonActive = activeNavFunction === "messenger";
    const isBellButtonActive = activeNavFunction === "bell";
    const isProfileButtonActive = activeNavFunction === "profile";

    const setExclusiveButtonState = (
        button: "squares" | "messenger" | "bell" | "profile",
        isActive: boolean
    ) => {
        if (isActive) {
            setActiveNavFunction(button);
        } else {
            setActiveNavFunction((current) => current === button ? null : current);
        }
    };
    
    return (
        <div className="flex gap-2">
            <NavbarButtonFunction
                icon={<PiSquaresFourFill className="text-2xl" />}
                onClick={(nextState) => setExclusiveButtonState("squares", nextState)}
                isActive={isSquaresButtonActive}
                className={navbarbuttonsClassName}
            />
            <NavbarButtonFunction
                icon={<FaFacebookMessenger className="text-2xl" />}
                onClick={(nextState) => setExclusiveButtonState("messenger", nextState)}
                isActive={isMessengerButtonActive}
                className={navbarbuttonsClassName}
            />
            <NavbarButtonFunction
                icon={<FaBell className="text-2xl" />}
                onClick={(nextState) => setExclusiveButtonState("bell", nextState)}
                className={navbarbuttonsClassName}
                isActive={isBellButtonActive}
            />
            <ProfilePicture
                imageSrc="/assets/blankprofile.png"
                alt="Profile"
                isActive={isProfileButtonActive}
                setIsActive={(nextState) => setExclusiveButtonState("profile", nextState)}
                className={profileButtonClassName}
                onClick={() => {}}
            />
        </div>
    )
}
