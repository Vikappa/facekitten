'use client'

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setActiveNavFunction, type NavFunction } from "@/lib/redux/uiSlice";
import NavbarButtonFunction, { ProfilePicture } from "../../atoms/NavbarFunctionButton";
import { PiSquaresFourFill } from "react-icons/pi";
import { FaFacebookMessenger } from "react-icons/fa";
import { FaBell } from "react-icons/fa";

export default function NavbarFunctions(){

    const navbarbuttonsClassName = "bg-tertiary text-dark-400 p-2 md:px-2 rounded-full transition-colors duration-100";
    const profileButtonClassName = "rounded-full overflow-hidden";
    const dispatch = useAppDispatch();
    const activeNavFunction = useAppSelector((state) => state.ui.activeNavFunction);
    const isSquaresButtonActive = activeNavFunction === "squares";
    const isMessengerButtonActive = activeNavFunction === "messenger";
    const isBellButtonActive = activeNavFunction === "bell";
    const isProfileButtonActive = activeNavFunction === "profile";
    const currentProfile = useAppSelector((state) => state.profile.currentProfile);
    const profileAvatar = currentProfile?.avatarUrl?.trim() ? currentProfile.avatarUrl : "/assets/blankprofile.png";
    
    const setExclusiveButtonState = (
        button: NavFunction,
        isActive: boolean
    ) => {
        dispatch(setActiveNavFunction(isActive ? button : null));
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
                imageSrc={profileAvatar ?? "/assets/blankprofile.png"}
                alt="Profile"
                isActive={isProfileButtonActive}
                setIsActive={(nextState) => setExclusiveButtonState("profile", nextState)}
                className={profileButtonClassName}
                onClick={() => {}}
            />
        </div>
    )
}
