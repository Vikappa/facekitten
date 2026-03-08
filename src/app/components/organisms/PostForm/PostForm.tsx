'use client';

import { useAppSelector } from "@/lib/redux/hooks";
import { ProfilePicture } from "../NavbarParts/MidNavbarButtonFunction";
import { ImFilePicture } from "react-icons/im";

export default function PostForm() {
    const currentProfile = useAppSelector((state) => state.profile.currentProfile);
    const profileName = currentProfile?.username?.trim() ? currentProfile.username : "Name";
    const profileAvatar = currentProfile?.avatarUrl?.trim() ? currentProfile.avatarUrl : "/assets/blankprofile.png";

    return (
        <form className="flex bg-white p-5 py-4 px-1">
            <ProfilePicture
                imageSrc={profileAvatar ?? "/assets/blankprofile.png"}
                alt="Profile"
                isActive={false}
                className="rounded-full overflow-hidden w-12 h-12 ms-1 me-2"
                />
            <input id="nameInput" type="text" placeholder={`Prrrr-rra ${profileName}?`} className="w-full px-5 py-0 bg-tertiary border-0 rounded-full border-gray-300 focus:outline-none " />
            <div className="flex flex-col py-0 pt-1 px-2 gap-1 items-center justify-content-center">
                <ImFilePicture className="text-green-500 text-2xl " />
                <span className="text-center text-xs">Foto</span>
            </div>
        </form>
    )
}
