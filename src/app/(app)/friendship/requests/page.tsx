'use client'

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FRIENDSHIP_STATUS, type WithFriendshipStatus } from "@/types/friendship";
import type { ProfileDto } from "@/types/db";

type ProfileWithFriendshipDto = WithFriendshipStatus & {
    profile: ProfileDto;
};

type ProfilesSuccessResponse = {
    code: "PROFILES_DATA_OK";
    profiles: ProfileWithFriendshipDto[];
};

function isProfilesSuccessResponse(payload: unknown): payload is ProfilesSuccessResponse {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const candidate = payload as Partial<ProfilesSuccessResponse>;
    return candidate.code === "PROFILES_DATA_OK" && Array.isArray(candidate.profiles);
}

export default function FriendshipRequestsPage() {
    const searchParams = useSearchParams();
    const highlightedSender = useMemo(
        () => (searchParams.get("sender") ?? "").trim(),
        [searchParams]
    );

    const [profiles, setProfiles] = useState<ProfileWithFriendshipDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingSenderIds, setProcessingSenderIds] = useState<string[]>([]);

    useEffect(() => {
        const controller = new AbortController();

        const request = async () => {
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
                    setError("Impossibile caricare le richieste di amicizia");
                    return;
                }

                setProfiles(payload.profiles);
            } catch (fetchError) {
                if ((fetchError as Error).name === "AbortError") {
                    return;
                }
                setError("Errore di rete nel caricamento richieste");
            } finally {
                setIsLoading(false);
            }
        };

        void request();

        return () => {
            controller.abort();
        };
    }, []);

    const receivedRequests = profiles.filter(
        (item) => item.friendshipStatus === FRIENDSHIP_STATUS.RICHIESTA_RICEVUTA
    );

    async function processRequest(senderProfileId: string, action: "accept" | "reject") {
        if (processingSenderIds.includes(senderProfileId)) {
            return;
        }

        setProcessingSenderIds((previous) => [...previous, senderProfileId]);
        setError(null);

        try {
            const endpoint =
                action === "accept"
                    ? "/api/v1/friendship/request/accept"
                    : "/api/v1/friendship/request/reject";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ senderProfileId }),
            });

            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                const message =
                    typeof payload?.error === "string"
                        ? payload.error
                        : "Impossibile processare la richiesta";
                setError(message);
                return;
            }

            setProfiles((previousProfiles) =>
                previousProfiles.map((item) =>
                    item.profile.id === senderProfileId
                        ? {
                            ...item,
                            friendshipStatus:
                                action === "accept"
                                    ? FRIENDSHIP_STATUS.AMICO
                                    : FRIENDSHIP_STATUS.NON_AMICO,
                        }
                        : item
                )
            );
        } catch (requestError) {
            console.error("Errore processazione richiesta amicizia:", requestError);
            setError("Errore di rete durante la processazione");
        } finally {
            setProcessingSenderIds((previous) =>
                previous.filter((profileId) => profileId !== senderProfileId)
            );
        }
    }

    return (
        <div className="mx-auto w-full max-w-2xl p-4">
            <h1 className="text-xl font-semibold text-gray-900">Richieste di amicizia</h1>
            <p className="mb-4 text-sm text-gray-500">
                Qui trovi le richieste che hai ricevuto.
            </p>

            {error && (
                <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            {isLoading && (
                <div className="grid min-h-[220px] w-full place-items-center">
                    <span className="loaderProfilePictures" aria-hidden="true"></span>
                </div>
            )}

            {!isLoading && receivedRequests.length === 0 && (
                <p className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
                    Non hai richieste di amicizia in sospeso.
                </p>
            )}

            {!isLoading && receivedRequests.length > 0 && (
                <div className="flex flex-col gap-3">
                    {receivedRequests.map(({ profile }) => {
                        const isProcessing = processingSenderIds.includes(profile.id);
                        const avatarUrl = profile.avatarUrl?.trim() || "/assets/blankprofile.png";
                        const username = profile.username?.trim() || "Utente";
                        const bio = profile.bio?.trim() || "Nessuna bio";
                        const isHighlighted = highlightedSender.length > 0 && highlightedSender === profile.id;

                        return (
                            <article
                                key={profile.id}
                                className={`flex items-center justify-between gap-3 rounded-xl border bg-white p-3 shadow-sm ${isHighlighted ? "border-primary" : "border-gray-200"}`}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                                        <Image
                                            src={avatarUrl}
                                            alt={`Immagine profilo di ${username}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <Link className="truncate font-semibold" href={`/profile/${profile.id}`}>
                                            {username}
                                        </Link>
                                        <p className="truncate text-sm text-gray-600">{bio}</p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void processRequest(profile.id, "reject");
                                        }}
                                        disabled={isProcessing}
                                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 disabled:opacity-60"
                                    >
                                        Rifiuta
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void processRequest(profile.id, "accept");
                                        }}
                                        disabled={isProcessing}
                                        className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
                                    >
                                        {isProcessing ? "Attendi..." : "Accetta"}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
