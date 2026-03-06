'use client';
import { useAppSelector } from "@/lib/redux/hooks";
import Image from "next/image";
import { MutableRefObject, useEffect, useState } from "react";
import ProfileModalRectangle from "./ProfileModalParts/ProfileModalRectangle";
import { IoMdSettings } from "react-icons/io";
import { BiSolidDoorOpen } from "react-icons/bi";
import { RiErrorWarningFill } from "react-icons/ri";
import { FaCircleQuestion } from "react-icons/fa6";
import { FaMoon } from "react-icons/fa";
import { RiUserCommunityFill } from "react-icons/ri";

interface ProfileModalProps {
    navbarRef: MutableRefObject<HTMLDivElement | null>;
}

export default function ProfileModal({ navbarRef }: ProfileModalProps) {
    const isOpen = useAppSelector((state) => state.ui.activeNavFunction === "profile");
    const [navbarHeight, setNavbarHeight] = useState(0);
    const [settingAndPrivacyOn, setSettingAndPrivacyOn] = useState(false);
    const [helpAndSupportOn, setHelpAndSupportOn] = useState(false);
    const [displayAndAccessybilityOn, setDisplayAndAccessybilityOn] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const navbarElement = navbarRef.current;
        if (!navbarElement) return;

        const updateNavbarHeight = () => {
            setNavbarHeight(navbarElement.getBoundingClientRect().height);
        };

        updateNavbarHeight();

        const resizeObserver = new ResizeObserver(updateNavbarHeight);
        resizeObserver.observe(navbarElement);
        window.addEventListener("resize", updateNavbarHeight);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateNavbarHeight);
        };
    }, [isOpen, navbarRef]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            style={{ top: `${navbarHeight}px` }}
            className="absolute w-full p-2 flex flex-col items-center align-content-center"
        >
            <div className="w-full flex flex-col p-3 pt-0 rounded-xl">
                <div className=" rounded-2xl p-3 bg-white customboxShadow">
                    <div className="customboxShadow p-3 rounded-xl mb-3">
                        <div className="w-full flex bg-trasparent rounded-xl " >
                            <div className="relative w-9 h-9">
                                <Image src="/assets/blankprofile.png" alt="Profile Picture" fill className="rounded-full mx-auto" />
                            </div>
                            <div className="flex align-bottom justify-content-center m-3 ms-2 mt-2">
                                <p className="m-0 font-bold">Name</p>
                            </div>
                        </div>
                        <hr className="mt-3 mx-3" />
                        <div className="w-full flex justify-center" >
                            <button className="bg-secondary rounded-xl font-bold m-3 py-2 mx-auto w-full text-md flex items-center justify-center gap-2">
                                <RiUserCommunityFill size={20} />
                                <span>Tutti i profili</span>
                            </button>
                        </div>
                    </div>
                    <ProfileModalRectangle text="Settings & Privacy" icon={<IoMdSettings className="text-2xl mx-auto my-auto" />} />
                    <ProfileModalRectangle text="Help & Support" icon={<FaCircleQuestion className="text-2xl mx-auto my-auto" />} />
                    <ProfileModalRectangle text="Display & Accessibility" icon={<FaMoon className="text-2xl mx-auto my-auto" />} />
                    <ProfileModalRectangle text="Give Feedback" icon={<RiErrorWarningFill className="text-2xl mx-auto my-auto" />} />
                    <ProfileModalRectangle text="Log out" icon={<BiSolidDoorOpen className="text-2xl mx-auto my-auto" />} />

                </div>
            </div>
        </div>
    );
}
