'use client'

import { useEffect, useState } from "react"
import Image from "next/image";
import type { ProfileDto } from "@/types/db";
import Link from "next/link";

type FriendshipStatus = "amico" | "non_amico" | "richiesta_inviata";

type ProfileWithFriendshipDto = {
    profile: ProfileDto;
    friendshipStatus: FriendshipStatus;
};

type ProfilesSuccessResponse = {
    code: "PROFILES_DATA_OK";
    profiles: ProfileWithFriendshipDto[];
};

type SendFriendRequestSuccessResponse = {
    code: "FRIEND_REQUEST_SENT" | "FRIEND_REQUEST_ALREADY_SENT";
    targetProfileId: string;
    friendshipStatus: "richiesta_inviata";
};

function isProfilesSuccessResponse(payload: unknown): payload is ProfilesSuccessResponse {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const candidate = payload as Partial<ProfilesSuccessResponse>;
    return candidate.code === "PROFILES_DATA_OK" && Array.isArray(candidate.profiles);
}

function isSendFriendRequestSuccessResponse(payload: unknown): payload is SendFriendRequestSuccessResponse {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const candidate = payload as Partial<SendFriendRequestSuccessResponse>;
    if (
        candidate.code !== "FRIEND_REQUEST_SENT" &&
        candidate.code !== "FRIEND_REQUEST_ALREADY_SENT"
    ) {
        return false;
    }

    return (
        typeof candidate.targetProfileId === "string" &&
        candidate.friendshipStatus === "richiesta_inviata"
    );
}

export default function BrowseMici(){

    const [profiles, setProfiles] = useState<ProfileWithFriendshipDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sendingRequestIds, setSendingRequestIds] = useState<string[]>([]);

    const handleSendFriendRequest = async (targetProfileId: string) => {
        if (sendingRequestIds.includes(targetProfileId)) {
            return;
        }

        setSendingRequestIds((previousIds) => [...previousIds, targetProfileId]);
        setError(null);

        try {
            const response = await fetch("/profile/all/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ targetProfileId }),
            });

            const payload = await response.json().catch(() => null);
            if (!response.ok || !isSendFriendRequestSuccessResponse(payload)) {
                setError("Impossibile inviare la richiesta di amicizia");
                return;
            }

            setProfiles((previousProfiles) =>
                previousProfiles.map((item) =>
                    item.profile.id === payload.targetProfileId
                        ? { ...item, friendshipStatus: "richiesta_inviata" }
                        : item
                )
            );
        } catch {
            setError("Errore di rete durante l'invio della richiesta");
        } finally {
            setSendingRequestIds((previousIds) =>
                previousIds.filter((profileId) => profileId !== targetProfileId)
            );
        }
    };

    useEffect(()=>{
        const controller = new AbortController();

        const request = async () =>{
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch("/profile/all", {
                    method: "GET",
                    signal: controller.signal,
                    cache: "no-store",
                });

                const payload = await response.json().catch(() => null);
                if (!response.ok || !isProfilesSuccessResponse(payload)) {
                    setError("Impossibile caricare i profili");
                    return;
                }

                setProfiles(payload.profiles);
            } catch (fetchError) {
                if ((fetchError as Error).name === "AbortError") {
                    return;
                }
                setError("Errore di rete nel caricamento dei profili");
            } finally {
                setIsLoading(false);
            }
        }

        request();

        return () => {
            controller.abort();
        };
    }, [])

    return (
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-3 p-4">
            {
                isLoading && (
                    <p className="text-sm text-gray-600">Caricamento profili...</p>
                )
            }
            {
                error && (
                    <p className="text-sm text-red-600">{error}</p>
                )
            }
            {
                profiles.map(({ profile, friendshipStatus }) =>  {
                    const avatarUrl = profile.avatarUrl?.trim() ? profile.avatarUrl : "/assets/blankprofile.png";
                    const username = profile.username?.trim() ? profile.username : "Profilo senza nome";
                    const bio = profile.bio?.trim() ? profile.bio : "Nessuna bio";
                    const isSendingRequest = sendingRequestIds.includes(profile.id);

                    return (
                        <article
                            key={profile.id}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative h-12 w-12 shrink-0">
                                    <Image
                                        src={avatarUrl}
                                        alt={`Immagine profilo di ${username}`}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <Link className="font-semibold truncate" href={`/profile/${profile.id}`}>{username}</Link>
                                    <p className="text-sm text-gray-600 truncate">{bio}</p>
                                </div>
                            </div>

                            {
                                friendshipStatus === "amico" ? (
                                    <span className="shrink-0 text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                                        Amico
                                    </span>
                                ) : friendshipStatus === "richiesta_inviata" ? (
                                    <span className="shrink-0 text-xs px-3 py-1 rounded-full font-medium bg-secondary text-gray-700">
                                        Richiesta inviata
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleSendFriendRequest(profile.id);
                                        }}
                                        disabled={isSendingRequest}
                                        className="shrink-0 text-xs px-3 py-1 rounded-md font-medium bg-primary text-white disabled:opacity-60"
                                    >
                                        {isSendingRequest ? "Invio..." : "Aggiungi ai mici"}
                                    </button>
                                )
                            }
                        </article>
                    );
                })
            }
        </div>
    )
}
