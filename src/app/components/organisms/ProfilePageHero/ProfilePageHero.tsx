'use client'
import { FaCamera } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import Image from "next/image";
import { patchCurrentProfile, UserProfile } from "@/lib/redux/profileSlice";
import { useRef, type ChangeEvent } from "react";

function getValidImageUrl(url: string | null | undefined, fallbackUrl: string) {
    const normalizedUrl = url?.trim();
    return normalizedUrl ? normalizedUrl : fallbackUrl;
}

function getValidBio(currentProfile: UserProfile | null) {
    if (currentProfile === null || !!currentProfile?.bio || currentProfile.bio.trim() === "") {
        return "Non hai una bio..";
    } else {
        return currentProfile.bio;
    }
}



export default function ProfilePageHero() {
    const dispatch = useAppDispatch();
    const currentProfile = useAppSelector((state) => state.profile.currentProfile);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectedAvatarFileRef = useRef<File | null>(null);

    const profileAvatar = getValidImageUrl(currentProfile?.avatarUrl, "/assets/blankprofile.png");
    const profileBanner = getValidImageUrl(currentProfile?.bannerUrl, "/assets/grumpy-cat-background-facebook-cover.jpg");
    const profileName = currentProfile?.username?.trim() ?? "";
    const profileBio = getValidBio(currentProfile);

    function handleUploadProfilePicture() {
        fileInputRef.current?.click();
    }

    async function handleChangeProfilePictureInput(e: ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        selectedAvatarFileRef.current = selectedFile;

        const formData = new FormData();
        formData.append("newImage", selectedAvatarFileRef.current);

        try {
            const response = await fetch("/profile/update/updateProfilePicture", {
                method: "POST",
                body: formData,
            });

            const payload = await response.json() as { avatarUrl?: string; error?: string };

            if (!response.ok) {
                console.error(payload.error ?? "Errore upload immagine profilo");
                return;
            }

            if (payload.avatarUrl) {
                dispatch(patchCurrentProfile({ avatarUrl: payload.avatarUrl }));
            }
        } catch (error) {
            console.error("Errore rete durante upload immagine profilo", error);
        } finally {
            e.target.value = "";
        }
    }

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
                    <div className="absolute bottom-0 right-0 rounded-full bg-secondary p-2.5 hover:cursor-pointer" onClick={handleUploadProfilePicture}>
                        <FaCamera className="" />
                        <input ref={fileInputRef} onChange={handleChangeProfilePictureInput} type="file" accept="image/*" className="hidden" />
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
