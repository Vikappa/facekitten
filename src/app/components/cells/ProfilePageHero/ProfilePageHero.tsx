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

function formatLocalizedDate(
    isoDate: string | null | undefined,
    fallbackLabel: string
) {
    const normalizedDate = isoDate?.trim();
    if (!normalizedDate) {
        return fallbackLabel;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalizedDate);
    if (!match) {
        return normalizedDate;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return normalizedDate;
    }

    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}

export default function ProfilePageHero({isCreatingPost, setPostClicked}: {isCreatingPost: boolean, setPostClicked: (val: boolean) => void}) {
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
    const birthDate = formatLocalizedDate(
        currentProfile?.dataDiNascita,
        "Data di nascita non impostata"
    );

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

    if(!currentProfile) return (<></>)

    return (
        <div className="relative overflow-hidden bg-white shadow-sm">
            <div className="relative h-40 sm:h-48">
                <Image
                    src={profileBanner}
                    alt="Profile banner"
                    width={1600}
                    height={900}
                    className="h-full w-full object-cover"
                />
                <button
                    type="button"
                    className="absolute bottom-3 right-3 z-20 rounded-full bg-secondary p-2.5 ring-2 ring-white hover:cursor-pointer"
                    onClick={handleUploadProfilePicture}
                    aria-label="Carica nuova immagine profilo"
                >
                    <FaCamera />
                </button>
            </div>

            <div className="bg-white px-5 pb-4">
                <div className="-mt-12 flex items-end gap-3 sm:-mt-14">
                    <div className="relative h-[100px] w-[100px] shrink-0">
                        <div className="h-full w-full overflow-hidden rounded-full bg-white ring-5 ring-white">
                            {
                                !isLoading ?
                                    <Image
                                        src={profileAvatar}
                                        alt={`${profileName} profile image`}
                                        width={100}
                                        height={100}
                                        className="h-full w-full object-cover"
                                    /> :
                                    <div className="flex h-full w-full items-center justify-center">
                                        <span className="loaderProfilePictures"></span>
                                    </div>
                            }
                        </div>

                        <button
                            type="button"
                            className="absolute bottom-0 right-0 rounded-full bg-secondary p-2.5 hover:cursor-pointer"
                            onClick={handleUploadProfilePicture}
                            aria-label="Aggiorna foto profilo"
                        >
                            <FaCamera />
                        </button>
                        <input ref={fileInputRef} onChange={handleChangeProfilePictureInput} type="file" accept="image/*" className="hidden" />
                    </div>
                    <h3 className="pb-2 text-2xl font-semibold">{profileName}</h3>
                </div>

                <div className="mt-3 flex flex-col bg-white">
                    <span className="flex w-full italic text-gray-400">
                        {profileBio}
                    </span>
                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                        <div className="flex flex-col">
                            <label htmlFor="profile-location" className="font-medium text-black">Location</label>
                            <input id="profile-location" className="rounded-md px-2 py-1" disabled value={location} />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="profile-cuccia" className="font-medium text-black">Tipo di cuccetta</label>
                            <input id="profile-cuccia" className="rounded-md px-2 py-1" disabled value={cuccetta} />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="profile-favtoy" className="font-medium text-black">Giocattolo prefe</label>
                            <input id="profile-favtoy" className="rounded-md px-2 py-1" disabled value={favToy} />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="profile-birthdate" className="font-medium text-black">Data di Nascita</label>
                            <input id="profile-birthdate" className="rounded-md px-2 py-1" disabled value={birthDate} />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button onClick={() => setPostClicked(!isCreatingPost)} className="mb-2 w-1/2 rounded-md bg-primary py-1.5 font-bold text-white">Crea Post</button>
                        <Link
                            href="/profile/modifica"
                            className="mb-2 w-1/2 rounded-md bg-tertiary py-1.5 text-center font-semibold text-gra"
                        >
                            Modifica Profilo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
