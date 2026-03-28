'use client';
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setActiveNavFunction } from "@/lib/redux/uiSlice";
import Image from "next/image";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import ProfileModalRectangle from "../cells/ProfileModalParts/ProfileModalRectangle";
import { IoMdSettings } from "react-icons/io";
import { BiSolidDoorOpen } from "react-icons/bi";
import { RiErrorWarningFill } from "react-icons/ri";
import { FaCircleQuestion } from "react-icons/fa6";
import { FaMoon } from "react-icons/fa";
import { RiUserCommunityFill } from "react-icons/ri";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IoFlagSharp } from "react-icons/io5";
import { MdPrivacyTip } from "react-icons/md";
import { RiGitRepositoryPrivateFill } from "react-icons/ri";
import { MdRoomPreferences } from "react-icons/md";
import { FaBug } from "react-icons/fa";
import { IoIosHelpCircle } from "react-icons/io";
import { MdAccountBox } from "react-icons/md";
import { HiMiniInboxArrowDown } from "react-icons/hi2";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { IoMdResize } from "react-icons/io";

interface ProfileModalProps {
    navbarRef: MutableRefObject<HTMLDivElement | null>;
}

export default function ProfileModal({ navbarRef }: ProfileModalProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const previousPathnameRef = useRef(pathname);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const isOpen = useAppSelector((state) => state.ui.activeNavFunction === "profile");
    const currentProfile = useAppSelector((state) => state.profile.currentProfile);
    const [navbarHeight, setNavbarHeight] = useState(0);
    const [settingAndPrivacyOn, setSettingAndPrivacyOn] = useState(false);
    const [helpAndSupportOn, setHelpAndSupportOn] = useState(false);
    const [displayAndAccessybilityOn, setDisplayAndAccessybilityOn] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const profileName = useAppSelector((state) => state.profile.currentProfile?.username)
    const profileAvatar = currentProfile?.avatarUrl?.trim() ? currentProfile.avatarUrl : "/assets/blankprofile.png";

    const resetProfileModalSections = () => {
        setSettingAndPrivacyOn(false);
        setHelpAndSupportOn(false);
        setDisplayAndAccessybilityOn(false);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            await fetch("/logout", { method: "POST" });
        } finally {
            resetProfileModalSections();

            router.replace("/login");
            router.refresh();
            setIsLoggingOut(false);
        }
    };

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

        resetProfileModalSections();

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateNavbarHeight);
        };
    }, [isOpen, navbarRef]);

    useEffect(() => {
        const previousPathname = previousPathnameRef.current;
        previousPathnameRef.current = pathname;

        if (!isOpen) {
            return;
        }

        if (previousPathname !== pathname) {
            dispatch(setActiveNavFunction(null));
        }
    }, [pathname, isOpen, dispatch]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) {
                return;
            }

            const clickedInsideModal = modalRef.current?.contains(target) ?? false;
            const clickedInsideNavbar = navbarRef.current?.contains(target) ?? false;

            if (clickedInsideModal || clickedInsideNavbar) {
                return;
            }

            dispatch(setActiveNavFunction(null));
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
        };
    }, [isOpen, dispatch, navbarRef]);

    if (!isOpen) {
        return null;
    }

    if (!!currentProfile || !!profileName) return (
        <div
            ref={modalRef}
            style={{ top: `${navbarHeight}px` }}
            className="fixed left-0 right-0 z-50 w-full p-2 flex flex-col items-center align-content-center"
        >
            <div className="w-full flex flex-col p-3 pt-0 rounded-xl">
                {
                    !settingAndPrivacyOn && !helpAndSupportOn && !displayAndAccessybilityOn && (
                        <div className=" rounded-2xl p-3 bg-white customboxShadow">
                            <div className="customboxShadow p-3 rounded-xl mb-3">
                                <Link className="w-full flex bg-trasparent rounded-xl " href="/profile">
                                    <div className="relative w-9 h-9">
                                        <Image src={profileAvatar} alt="Profile Picture" fill className="rounded-full mx-auto" />
                                    </div>
                                    <div className="flex align-bottom justify-content-center m-3 ms-2 mt-2">
                                        <p className="m-0 font-bold">{profileName}</p>
                                    </div>
                                </Link>
                                <hr className="mt-3 mx-3" />
                                <div className="w-full flex justify-center" >
                                    <button className="bg-secondary rounded-xl font-bold m-3 py-2 mx-auto w-full text-md flex items-center justify-center gap-2">
                                        <RiUserCommunityFill size={20} />
                                        <Link href={"/profile/all/browse"}>Tutti i profili</Link>
                                    </button>
                                </div>
                            </div>
                            <ProfileModalRectangle text="Settings & Privacy" icon={<IoMdSettings className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />
                            <ProfileModalRectangle text="Help & Support" icon={<FaCircleQuestion className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setHelpAndSupportOn(true)} />
                            <ProfileModalRectangle text="Display & Accessibility" icon={<FaMoon className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setDisplayAndAccessybilityOn(true)} />
                            <ProfileModalRectangle text="Give Feedback" icon={<RiErrorWarningFill className="text-2xl mx-auto my-auto" />} showArrow={false} href="/feedback" />
                            <ProfileModalRectangle
                                text={isLoggingOut ? "Logging out..." : "Log out"}
                                icon={<BiSolidDoorOpen className="text-2xl mx-auto my-auto" />}
                                showArrow={false}
                                onClick={handleLogout}
                            />
                        </div>
                    )
                }
                {
                    settingAndPrivacyOn && !helpAndSupportOn && !displayAndAccessybilityOn && (
                        <div className=" rounded-2xl p-3 bg-white customboxShadow">
                            <button
                                type="button"
                                onClick={resetProfileModalSections}
                                className="mb-3 flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-gray-100 active:bg-gray-100"
                            >
                                <MdOutlineKeyboardArrowLeft size={22} />
                                <span className="font-semibold">Settings & Privacy</span>
                            </button>
                            <ProfileModalRectangle text="Settings" icon={<IoMdSettings className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />
                            <ProfileModalRectangle text="Language" icon={<IoFlagSharp className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />
                            <ProfileModalRectangle text="Privacy checkup" icon={<MdPrivacyTip className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />
                            <ProfileModalRectangle text="Privacy Center" icon={<RiGitRepositoryPrivateFill className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />
                            <ProfileModalRectangle text="Activity Log" icon={<IoMdSettings className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />
                            <ProfileModalRectangle text="Content Preferences" icon={<MdRoomPreferences className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />

                        </div>
                    )
                }
                {
                    !settingAndPrivacyOn && helpAndSupportOn && !displayAndAccessybilityOn && (
                        <div className=" rounded-2xl p-3 bg-white customboxShadow">
                            <button
                                type="button"
                                onClick={resetProfileModalSections}
                                className="mb-3 flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-gray-100 active:bg-gray-100"
                            >
                                <MdOutlineKeyboardArrowLeft size={22} />
                                <span className="font-semibold">Help & Support</span>
                            </button>
                            <ProfileModalRectangle text="Help Center" icon={<IoIosHelpCircle className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />
                            <ProfileModalRectangle text="Account Status" icon={<MdAccountBox className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />
                            <ProfileModalRectangle text="Support inbox" icon={<HiMiniInboxArrowDown className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />
                            <ProfileModalRectangle text="Privacy Center" icon={<MdOutlinePrivacyTip className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />
                            <ProfileModalRectangle text="Report a problem" icon={<FaBug className="text-2xl mx-auto my-auto" />} showArrow={true} onClick={() => setSettingAndPrivacyOn(true)} />
                        </div>
                    )
                }
                {
                    !settingAndPrivacyOn && !helpAndSupportOn && displayAndAccessybilityOn && (
                        <div className=" rounded-2xl p-3 bg-white customboxShadow">
                            <button
                                type="button"
                                onClick={resetProfileModalSections}
                                className="mb-3 flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-gray-100 active:bg-gray-100"
                            >
                                <MdOutlineKeyboardArrowLeft size={22} />
                                <span className="font-semibold">Display & Accessibility</span>

                            </button>
                            <div className="flex items-center gap-2 px-2 py-1">
                                <div className="bg-secondary flex align-items-center justify-content-center rounded-full p-2 transition-colors duration-200 group-hover:bg-gray-200 group-active:bg-gray-200">
                                    <FaMoon className="text-lg shrink-0" />
                                </div>
                                <span className="font-semibold leading-none text-xl">Dark Mode</span>
                            </div>
                            <div className="flex items-center p-2 ms-5">
                                On
                                <input className="ms-auto h-5 w-5 accent-black" type="radio" name="dark-mode" />
                            </div>
                            <div className="flex items-center p-2 ms-5">
                                Off
                                <input className="ms-auto h-5 w-5 accent-black" type="radio" name="dark-mode" />
                            </div>

                            <div className="flex items-center gap-2 px-2 py-1">
                                <div className="bg-secondary flex align-items-center justify-content-center rounded-full p-2 transition-colors duration-200 group-hover:bg-gray-200 group-active:bg-gray-200">
                                    <IoMdResize className="text-lg shrink-0" />
                                </div>
                                <span className="font-semibold leading-none text-xl">Compact Mode</span>
                            </div>
                            <div className="flex items-center p-2 ms-5">
                                On
                                <input className="ms-auto h-5 w-5 accent-black" type="radio" name="dark-mode" />
                            </div>
                            <div className="flex items-center p-2 ms-5">
                                Off
                                <input className="ms-auto h-5 w-5 accent-black" type="radio" name="dark-mode" />
                            </div>

                        </div>
                    )
                }

            </div>
        </div>
    );
}
