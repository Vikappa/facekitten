'use client';

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { patchCurrentProfile } from "@/lib/redux/profileSlice";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { FaCamera } from "react-icons/fa";

function getValidImageUrl(url: string | null | undefined, fallbackUrl: string) {
    const normalizedUrl = url?.trim();
    return normalizedUrl ? normalizedUrl : fallbackUrl;
}

export default function ProfilePageHero() {
    const dispatch = useAppDispatch();

    const currentProfile = useAppSelector((state) => state.profile.currentProfile);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectedAvatarFileRef = useRef<File | null>(null);

    const profileAvatar = getValidImageUrl(currentProfile?.avatarUrl, "/assets/blankprofile.png");
    const profileBanner = getValidImageUrl(currentProfile?.bannerUrl, "/assets/grumpy-cat-background-facebook-cover.jpg");
    const profileName = currentProfile?.username?.trim() || "Profilo";
    const profileBio = currentProfile?.bio?.trim() || "Non hai una bio..";
    const location = currentProfile?.location?.trim() || "Nessuna location impostata";
    const cuccetta = currentProfile?.tipoCuccia ?? "Nessuna cuccia impostata";
    const favToy = currentProfile?.giocattoloPreferito?.trim() || "Nessun giocattolo preferito";
    const birthDate = currentProfile?.dataDiNascita?.trim() || "Data di nascita non impostata";

    const [isLoading, setIsLoading] = useState(false);

    function handleUploadProfilePicture() {
        fileInputRef.current?.click();
    }

    async function handleChangeProfilePictureInput(e: ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        setIsLoading(true);
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
            setIsLoading(false);
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
                <div className="absolute bottom-0 right-0 z-20 rounded-full bg-secondary ring-2 ring-white p-2.5 -translate-y-1/2 hover:cursor-pointer me-2" onClick={handleUploadProfilePicture}>
                    <FaCamera className="" />
                </div>
            </div>

            <div className="flex h-1/5 items-center">

                <div className="flex aspect-square ms-3 relative ">
                    {
                        !isLoading ?
                            <Image
                                src={profileAvatar}
                                alt={`${profileName} profile image`}
                                width={100}
                                height={100}
                                className="rounded-full object-cover ring-5 ring-white"
                            /> :
                            <div className="w-[100px] h-[100px] p-6">
                                <span className="loaderProfilePictures"></span>
                            </div>
                    }

                    <div className="absolute bottom-0 right-0 rounded-full bg-secondary p-2.5 hover:cursor-pointer" onClick={handleUploadProfilePicture}>
                        <FaCamera className="" />
                        <input ref={fileInputRef} onChange={handleChangeProfilePictureInput} type="file" accept="image/*" className="hidden" />
                    </div>
                </div>
                <h3 className="self-center px-3 text-2xl font-semibold">{profileName}</h3>
            </div>

            <div className="flex flex-col align-middle bg-white px-5 pt-8 ">
                <span className="flex w-full text-gray-400 italic">
                    {profileBio}
                </span>
                <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                    <div className="flex flex-col">
                        <label htmlFor="profile-location" className="font-medium text-black">Location</label>
                        <input id="profile-location" className="rounded-md px-2 py-1" disabled value={location} />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="profile-cuccia" className="font-medium text-black">Cuccia</label>
                        <input id="profile-cuccia" className="rounded-md px-2 py-1" disabled value={cuccetta} />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="profile-favtoy" className="font-medium text-black">Giocattolo</label>
                        <input id="profile-favtoy" className="rounded-md px-2 py-1" disabled value={favToy} />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="profile-birthdate" className="font-medium text-black">Nascita</label>
                        <input id="profile-birthdate" className="rounded-md px-2 py-1" disabled value={birthDate} />
                    </div>
                </div>
                <div className="flex gap-2 mt-auto">
                    <button className="bg-primary text-white w-1/2 font-bold mb-2 rounded-md py-1.5">Crea Post</button>
                    <Link
                        href="/profile/modifica"
                        className="bg-tertiary text-gra w-1/2 font-semibold mb-2 rounded-md py-1.5 text-center"
                    >
                        Modifica Profilo
                    </Link>
                </div>
            </div>

        </div>
    );
}
