'use client'
import { FaCamera } from "react-icons/fa";
import { useAppSelector } from "@/lib/redux/hooks";
import Image from "next/image";
import { UserProfile } from "@/lib/redux/profileSlice";

function getValidImageUrl(url: string | null | undefined, fallbackUrl: string) {
    const normalizedUrl = url?.trim();
    return normalizedUrl ? normalizedUrl : fallbackUrl;
}

function getValidBio(currentProfile :  UserProfile | null){
    if(currentProfile === null || !!currentProfile?.bio || currentProfile.bio.trim() === "") {
        return "Non hai una bio..";
    } else {
        return currentProfile.bio;
    }
}

export default function ProfilePageHero() {
    const currentProfile = useAppSelector((state) => state.profile.currentProfile);

    const profileAvatar = getValidImageUrl(currentProfile?.avatarUrl, "/assets/blankprofile.png");
    const profileBanner = getValidImageUrl(currentProfile?.bannerUrl, "/assets/grumpy-cat-background-facebook-cover.jpg");
    const profileName = currentProfile?.username?.trim() ?? "";
    const profileBio = getValidBio(currentProfile);

    return (
        <div className="relative h-80 bg-white">
            <div className="relative h-2/5">
                <div className="h-full overflow-hidden">
                    <Image
                        src={profileBanner}
                        alt="Profile banner"
                        width={1600}
                        height={900}
                        className="w-full h-auto"
                    />
                </div>
                <div className="absolute bottom-0 right-0 z-20 rounded-full bg-secondary ring-2 ring-white p-2.5 -translate-y-1/2 hover:cursor-pointer me-2">
                    <FaCamera className="" />
                </div>
            </div>

            <div className="flex h-1/5 items-center">

                <div className="flex aspect-square ms-3 relative">
                    <Image
                        src={profileAvatar}
                        alt={profileName}
                        width={100}
                        height={100}
                        className="rounded-full object-cover ring-5 ring-white"
                    />
                    <div className="absolute bottom-0 right-0 rounded-full bg-secondary p-2.5 hover:cursor-pointer">
                        <FaCamera className="" />
                    </div>
                </div>
                <h3 className="self-center px-3 text-2xl font-semibold">{profileName}</h3>
            </div>

            <div className="flex flex-col h-2/5 align-middle bg-white px-5 pt-8 ">
                <span className="flex w-full text-gray-400 italic">
                    {profileBio}
                </span>
                <div className="flex gap-2 mt-auto">
                    <button className="bg-primary text-white w-1/2 font-bold mb-2 rounded-md py-1.5">Crea Post</button>
                    <button className="bg-tertiary text-gra w-1/2 font-semibold mb-2 rounded-md py-1.5">Modifica Profilo</button>
                </div>
            </div>

        </div>
    )
}
