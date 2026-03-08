'use client'

import { useAppDispatch } from "@/lib/redux/hooks";
import { patchCurrentProfile } from "@/lib/redux/profileSlice";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaCamera } from "react-icons/fa";
import { useEffect, useState } from "react";

export type ProfileEditPayload = {
    username: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    bio: string | null;
    confirmedAccount: boolean | null;
};

type ProfileEditSuccessResponse = {
    code: "PROFILE_DATA_OK";
    profile: ProfileEditPayload;
};

type ProfileSetDataSuccessResponse = {
    code: "PROFILE_UPDATED";
    profileId: string;
    profile: ProfileEditPayload;
};

type ProfileEditErrorResponse = {
    code?: string;
    error?: string;
};

function getValidImageUrl(url: string | null | undefined, fallbackUrl: string) {
    const normalizedUrl = url?.trim();
    return normalizedUrl ? normalizedUrl : fallbackUrl;
}

function isProfileEditSuccessResponse(payload: unknown): payload is ProfileEditSuccessResponse {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const candidate = payload as Partial<ProfileEditSuccessResponse>;
    if (candidate.code !== "PROFILE_DATA_OK") {
        return false;
    }

    const profile = candidate.profile as Partial<ProfileEditPayload> | undefined;
    return !!profile && typeof profile.username === "string";
}

function isProfileSetDataSuccessResponse(payload: unknown): payload is ProfileSetDataSuccessResponse {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const candidate = payload as Partial<ProfileSetDataSuccessResponse>;
    if (candidate.code !== "PROFILE_UPDATED" || typeof candidate.profileId !== "string") {
        return false;
    }

    const profile = candidate.profile as Partial<ProfileEditPayload> | undefined;
    return !!profile && typeof profile.username === "string";
}

function handleUploadProfilePicture() {

}

export default function ModificaProfilePage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [currentProfile, setCurrentProfile] = useState<ProfileEditPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const profileBanner = getValidImageUrl(
        currentProfile?.bannerUrl,
        "/assets/grumpy-cat-background-facebook-cover.jpg"
    );

    useEffect(() => {
        const controller = new AbortController();

        const loadProfileData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch("/profile/modifica/getdata", {
                    method: "GET",
                    signal: controller.signal,
                    cache: "no-store",
                });

                let payload: unknown = null;
                try {
                    payload = await response.json();
                } catch {
                    payload = null;
                }

                if (!response.ok) {
                    const errorPayload = (payload as ProfileEditErrorResponse | null) ?? null;
                    setError(errorPayload?.error ?? "Errore nel recupero del profilo");
                    return;
                }

                if (!isProfileEditSuccessResponse(payload)) {
                    setError("Risposta profilo non valida");
                    return;
                }

                setCurrentProfile(payload.profile);
            } catch (e) {
                if (e instanceof DOMException && e.name === "AbortError") {
                    return;
                }

                setError("Errore di rete durante il recupero del profilo");
            } finally {
                setIsLoading(false);
            }
        };

        void loadProfileData();

        return () => {
            controller.abort();
        };
    }, []);

    const handleSaveProfile = async () => {
        if (!currentProfile) {
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch("/profile/modifica/setdata", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: currentProfile.username,
                    bio: currentProfile.bio,
                }),
            });

            let payload: unknown = null;
            try {
                payload = await response.json();
            } catch {
                payload = null;
            }

            if (!response.ok) {
                const errorPayload = (payload as ProfileEditErrorResponse | null) ?? null;
                setError(errorPayload?.error ?? "Errore nel salvataggio del profilo");
                return;
            }

            if (!isProfileSetDataSuccessResponse(payload)) {
                setError("Risposta salvataggio non valida");
                return;
            }

            setCurrentProfile(payload.profile);
            dispatch(
                patchCurrentProfile({
                    username: payload.profile.username,
                    bio: payload.profile.bio ?? "",
                    ...(payload.profile.avatarUrl !== null
                        ? { avatarUrl: payload.profile.avatarUrl }
                        : {}),
                    ...(payload.profile.bannerUrl !== null
                        ? { bannerUrl: payload.profile.bannerUrl }
                        : {}),
                    ...(typeof payload.profile.confirmedAccount === "boolean"
                        ? { confirmedAccount: payload.profile.confirmedAccount }
                        : {}),
                })
            );
            router.replace("/profile");
        } catch {
            setError("Errore di rete durante il salvataggio");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white" >
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
            <div className="flex flex-col p-5">
                <span>{isLoading ? "Caricamento profilo..." : error ?? (currentProfile?.username ?? "")}</span>
                <textarea
                    className="bg-tertiary m-2 rounded-xl focus:ring-0 focus:outline-0 p-5"
                    value={currentProfile?.bio ?? ""}

                    onChange={(e) => {
                        const nextBio = e.target.value;
                        setCurrentProfile((prev) => {
                            if (!prev) {
                                return prev;
                            }

                            return {
                                ...prev,
                                bio: nextBio,
                            };
                        });
                    }}
                />
            </div>
            <div className="flex justify-content-end p-2 gap-2">
                <button className="ms-auto bg-tertiary w-1/3 rounded-lg py-1 font-semibold text-dark-700">Annulla</button>
                <button
                    className="bg-primary w-1/3 rounded-lg py-1 font-semibold text-white disabled:opacity-60"
                    onClick={handleSaveProfile}
                    disabled={isSaving || isLoading || !currentProfile}
                >
                    {isSaving ? "Salvataggio..." : "Salva"}
                </button>
            </div>
        </div>
    );
}
