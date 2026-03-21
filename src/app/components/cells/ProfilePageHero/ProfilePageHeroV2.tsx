'use client'

import { FRIENDSHIP_STATUS, type FriendshipStatus } from "@/types/friendship";
import { Database } from "@/types/database.types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    FaCheck,
    FaFacebookMessenger,
    FaPaperPlane,
    FaUserClock,
    FaUserPlus,
} from "react-icons/fa6";

export interface ProfilePageHeroV2Props {
    userToRender?: FriendUserProfile
    friendshipStatus: FriendshipStatus
}

export interface FriendUserProfile {
    id: string;
    email: string;
    username: string;
    avatarUrl: string;
    bannerUrl: string;
    bio: string;
    confirmedAccount: boolean;
    dataDiNascita: string | null;
    giocattoloPreferito: string;
    locationId: string;
    tipoCuccia: Database["public"]["Enums"]["Lettino"] | null;
}

type SendFriendRequestSuccessResponse = {
    code: "FRIEND_REQUEST_SENT" | "FRIEND_REQUEST_ALREADY_SENT";
    targetProfileId: string;
    friendshipStatus: FriendshipStatus;
};

type AcceptFriendRequestSuccessResponse = {
    code: "FRIEND_REQUEST_ACCEPTED";
    friendshipStatus: FriendshipStatus;
};

type RemoveFriendSuccessResponse = {
    code: "FRIEND_REMOVED" | "FRIENDSHIP_ALREADY_REMOVED";
    targetProfileId: string;
    friendshipStatus: FriendshipStatus;
};

function isErrorPayload(payload: unknown): payload is { error?: string } {
    return typeof payload === "object" && payload !== null;
}

function isSendFriendRequestSuccessResponse(payload: unknown): payload is SendFriendRequestSuccessResponse {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const candidate = payload as Partial<SendFriendRequestSuccessResponse>;
    return (
        (candidate.code === "FRIEND_REQUEST_SENT" || candidate.code === "FRIEND_REQUEST_ALREADY_SENT") &&
        typeof candidate.targetProfileId === "string"
    );
}

function isAcceptFriendRequestSuccessResponse(payload: unknown): payload is AcceptFriendRequestSuccessResponse {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const candidate = payload as Partial<AcceptFriendRequestSuccessResponse>;
    return candidate.code === "FRIEND_REQUEST_ACCEPTED";
}

function isRemoveFriendSuccessResponse(payload: unknown): payload is RemoveFriendSuccessResponse {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const candidate = payload as Partial<RemoveFriendSuccessResponse>;
    return (
        (candidate.code === "FRIEND_REMOVED" || candidate.code === "FRIENDSHIP_ALREADY_REMOVED") &&
        typeof candidate.targetProfileId === "string"
    );
}

export default function ProfilePageHeroV2(props: ProfilePageHeroV2Props) {
    const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>(props.friendshipStatus);
    const [isSendingFriendRequest, setIsSendingFriendRequest] = useState(false);
    const [isAcceptingFriendRequest, setIsAcceptingFriendRequest] = useState(false);
    const [isRemovingFriend, setIsRemovingFriend] = useState(false);
    const [isFriendMenuOpen, setIsFriendMenuOpen] = useState(false);
    const [friendMenuPosition, setFriendMenuPosition] = useState<{
        top: number;
        left: number;
        width: number;
    } | null>(null);
    const [friendshipActionError, setFriendshipActionError] = useState<string | null>(null);
    const friendMenuContainerRef = useRef<HTMLDivElement | null>(null);
    const friendMenuButtonRef = useRef<HTMLButtonElement | null>(null);
    const friendMenuDropdownRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        setFriendshipStatus(props.friendshipStatus);
    }, [props.friendshipStatus]);

    useEffect(() => {
        if (friendshipStatus !== FRIENDSHIP_STATUS.AMICO) {
            setIsFriendMenuOpen(false);
        }
    }, [friendshipStatus]);

    useEffect(() => {
        if (!isFriendMenuOpen) {
            return;
        }

        const closeOnOutsideClick = (event: MouseEvent) => {
            const menuContainer = friendMenuContainerRef.current;
            const menuDropdown = friendMenuDropdownRef.current;
            if (!(event.target instanceof Node)) {
                return;
            }

            const clickedInsideContainer = menuContainer?.contains(event.target) ?? false;
            const clickedInsideDropdown = menuDropdown?.contains(event.target) ?? false;
            if (!clickedInsideContainer && !clickedInsideDropdown) {
                setIsFriendMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", closeOnOutsideClick);

        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick);
        };
    }, [isFriendMenuOpen]);

    useEffect(() => {
        if (!isFriendMenuOpen) {
            setFriendMenuPosition(null);
            return;
        }

        const updateFriendMenuPosition = () => {
            const friendMenuButton = friendMenuButtonRef.current;
            if (!friendMenuButton) {
                setFriendMenuPosition(null);
                return;
            }

            const buttonRect = friendMenuButton.getBoundingClientRect();
            setFriendMenuPosition({
                top: Math.round(buttonRect.bottom + 4),
                left: Math.round(buttonRect.left),
                width: Math.round(buttonRect.width),
            });
        };

        updateFriendMenuPosition();
        window.addEventListener("resize", updateFriendMenuPosition);
        window.addEventListener("scroll", updateFriendMenuPosition, true);

        return () => {
            window.removeEventListener("resize", updateFriendMenuPosition);
            window.removeEventListener("scroll", updateFriendMenuPosition, true);
        };
    }, [isFriendMenuOpen]);

    const handleSendFriendRequest = async () => {
        const targetProfileId = props.userToRender?.id?.trim();
        if (!targetProfileId || isSendingFriendRequest) {
            return;
        }

        setIsSendingFriendRequest(true);
        setFriendshipActionError(null);

        try {
            const response = await fetch(
                `/api/v1/friendship/request/send/${encodeURIComponent(targetProfileId)}`,
                {
                    method: "POST",
                }
            );

            const payload: unknown = await response.json().catch(() => null);
            if (!response.ok) {
                setFriendshipActionError(
                    isErrorPayload(payload) ? payload.error ?? "Impossibile inviare la richiesta di amicizia" : "Impossibile inviare la richiesta di amicizia"
                );
                return;
            }

            if (isSendFriendRequestSuccessResponse(payload)) {
                setFriendshipStatus(FRIENDSHIP_STATUS.RICHIESTA_INVIATA);
                return;
            }

            setFriendshipActionError("Risposta non valida durante l'invio della richiesta");
        } catch {
            setFriendshipActionError("Errore di rete durante l'invio della richiesta");
        } finally {
            setIsSendingFriendRequest(false);
        }
    };

    const handleAcceptFriendRequest = async () => {
        if (isAcceptingFriendRequest) {
            return;
        }

        const PLACEHOLDER_REQUEST_ID = -1;

        setIsAcceptingFriendRequest(true);
        setFriendshipActionError(null);

        try {
            const response = await fetch("/api/v1/friendship/request/accept", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    requestId: PLACEHOLDER_REQUEST_ID,
                }),
            });

            const payload: unknown = await response.json().catch(() => null);
            if (!response.ok) {
                setFriendshipActionError(
                    isErrorPayload(payload)
                        ? payload.error ?? "Accettazione non disponibile: sostituire il requestId placeholder quando avremo la lista richieste"
                        : "Accettazione non disponibile: sostituire il requestId placeholder quando avremo la lista richieste"
                );
                return;
            }

            if (isAcceptFriendRequestSuccessResponse(payload)) {
                setFriendshipStatus(FRIENDSHIP_STATUS.AMICO);
                return;
            }

            setFriendshipActionError("Risposta non valida durante l'accettazione");
        } catch {
            setFriendshipActionError("Errore di rete durante l'accettazione della richiesta");
        } finally {
            setIsAcceptingFriendRequest(false);
        }
    };

    const handleRemoveFriend = async () => {
        const targetProfileId = props.userToRender?.id?.trim();
        if (!targetProfileId || isRemovingFriend) {
            return;
        }

        setIsRemovingFriend(true);
        setFriendshipActionError(null);

        try {
            const response = await fetch(
                `/api/v1/friendship/remove/${encodeURIComponent(targetProfileId)}`,
                {
                    method: "DELETE",
                }
            );

            const payload: unknown = await response.json().catch(() => null);
            if (!response.ok) {
                setFriendshipActionError(
                    isErrorPayload(payload) ? payload.error ?? "Impossibile rimuovere l'amicizia" : "Impossibile rimuovere l'amicizia"
                );
                return;
            }

            if (isRemoveFriendSuccessResponse(payload)) {
                setFriendshipStatus(FRIENDSHIP_STATUS.NON_AMICO);
                setIsFriendMenuOpen(false);
                return;
            }

            setFriendshipActionError("Risposta non valida durante la rimozione amicizia");
        } catch {
            setFriendshipActionError("Errore di rete durante la rimozione amicizia");
        } finally {
            setIsRemovingFriend(false);
        }
    };

    return (
        <>
            <div className="relative overflow-hidden bg-white shadow-sm">
            <div className="relative h-40 sm:h-48">
                <Image
                    src={(props.userToRender?.bannerUrl && props.userToRender?.bannerUrl.trim() !== "") ? props.userToRender?.bannerUrl : "/assets/grumpy-cat-background-facebook-cover.jpg"}
                    alt="Profile banner"
                    width={1600}
                    height={900}
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="bg-white px-5 pb-4">
                <div className="-mt-12 flex items-end gap-3 sm:-mt-14">
                    <div className="relative h-[100px] w-[100px] shrink-0">
                        <div className="h-full w-full overflow-hidden rounded-full bg-white ring-5 ring-white">

                            <Image
                                src={props.userToRender?.avatarUrl ?? '/assets/blankprofile.png'}
                                alt={`${props.userToRender?.username} profile image`}
                                width={100}
                                height={100}
                                className="h-full w-full object-cover"
                            /> :
                            <div className="flex h-full w-full items-center justify-center">
                                <span className="loaderProfilePictures"></span>
                            </div>

                        </div>

                    </div>
                    <h3 className="pb-2 text-2xl font-semibold">{props.userToRender?.username}</h3>
                </div>

                <div className="mt-3 flex flex-col bg-white">
                    <span className="flex w-full italic text-gray-400">
                        {props.userToRender?.bio}
                    </span>
                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">

                        {
                            props.userToRender?.locationId &&
                            <div className="flex flex-col">
                                <label htmlFor="profile-location" className="font-medium text-black">Location</label>
                                <input onChange={() => { }} id="profile-location" className="rounded-md px-2 py-1" disabled value={props.userToRender?.locationId} />
                            </div>
                        }

                        {
                            props.userToRender?.tipoCuccia &&
                            < div className="flex flex-col">
                                <label htmlFor="profile-cuccia" className="font-medium text-black">Tipo di cuccetta</label>
                                <input onChange={() => { }} id="profile-cuccia" className="rounded-md px-2 py-1" disabled value={props.userToRender?.tipoCuccia ?? undefined} />
                            </div>
                        }

                        {
                            !!props.userToRender?.giocattoloPreferito &&
                            <div className="flex flex-col">
                                <label htmlFor="profile-favtoy" className="font-medium text-black">Giocattolo prefe</label>
                                <input onChange={() => { }} id="profile-favtoy" className="rounded-md px-2 py-1" disabled value={props.userToRender?.giocattoloPreferito} />
                            </div>
                        }

                        {
                            props.userToRender?.dataDiNascita &&
                            <div className="flex flex-col">
                                <label htmlFor="profile-birthdate" className="font-medium text-black">Data di Nascita</label>
                                <input onChange={() => { }} id="profile-birthdate" className="rounded-md px-2 py-1" disabled value={props.userToRender?.dataDiNascita ?? ''} />
                            </div>
                        }
                    </div>
                    <div className="mt-4 flex gap-2">
                        {
                            friendshipStatus === FRIENDSHIP_STATUS.AMICO &&
                            <div ref={friendMenuContainerRef} className="mb-2 w-1/2">
                                <button
                                    ref={friendMenuButtonRef}
                                    type="button"
                                    onClick={() => {
                                        setIsFriendMenuOpen((previousValue) => !previousValue);
                                    }}
                                    className="px-2 text-sm flex w-full items-center justify-center gap-2 rounded-md bg-tertiary py-1.5 font-bold text-dark-800"
                                >
                                    <FaCheck className="shrink-0 text-sm" />
                                    Mici
                                </button>
                            </div>
                        }
                        {
                            friendshipStatus === FRIENDSHIP_STATUS.NON_AMICO &&
                            <button
                                type="button"
                                onClick={() => {
                                    void handleSendFriendRequest();
                                }}
                                disabled={isSendingFriendRequest}
                                className="mb-2 px-2 text-sm flex w-1/2 items-center justify-center gap-2 rounded-md bg-primary py-1.5 font-bold text-white disabled:opacity-60"
                            >
                                <FaUserPlus className="shrink-0 text-sm" />
                                {isSendingFriendRequest ? "Invio..." : "Aggiungi ai mici"}
                            </button>
                        }
                        {
                            friendshipStatus === FRIENDSHIP_STATUS.RICHIESTA_INVIATA &&
                            <button className="mb-2 px-2 text-sm flex w-1/2 items-center justify-center gap-2 rounded-md bg-secondary py-1.5 font-bold text-gray-700">
                                <FaPaperPlane className="shrink-0 text-sm" />
                                Richiesta di micizia inviata
                            </button>
                        }
                        {
                            friendshipStatus === FRIENDSHIP_STATUS.RICHIESTA_RICEVUTA &&
                            <button
                                type="button"
                                onClick={() => {
                                    void handleAcceptFriendRequest();
                                }}
                                disabled={isAcceptingFriendRequest}
                                className="mb-2 px-2 text-sm flex w-1/2 items-center justify-center gap-2 rounded-md bg-secondary py-1.5 font-bold text-gray-700 disabled:opacity-60"
                            >
                                <FaUserClock className="shrink-0 text-sm" />
                                {isAcceptingFriendRequest ? "Conferma..." : "Accetta Richiesta di Micizia"}
                            </button>
                        }
                        <button
                            className={`mb-2 flex w-1/2 items-center justify-center gap-2 rounded-md ${props.friendshipStatus ? "bg-primary" : "bg-tertiary"} py-1.5 font-semibold ${props.friendshipStatus ? "text-white":""}`}
                        >
                            Messaggia <FaFacebookMessenger className="shrink-0 text-base px-0" />
                        </button>
                    </div>
                    {
                        friendshipActionError &&
                        <span className="text-xs text-red-600">{friendshipActionError}</span>
                    }
                </div>
            </div>
            </div>
            {
                isFriendMenuOpen &&
                friendMenuPosition &&
                typeof document !== "undefined" &&
                createPortal(
                    <button
                        ref={friendMenuDropdownRef}
                        type="button"
                        onClick={() => {
                            void handleRemoveFriend();
                        }}
                        disabled={isRemovingFriend}
                        style={{
                            top: friendMenuPosition.top,
                            left: friendMenuPosition.left,
                            width: friendMenuPosition.width,
                            position: "fixed",
                        }}
                        className="z-[100] rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-sm font-semibold text-red-600 shadow-md disabled:opacity-60"
                    >
                        {isRemovingFriend ? "Rimozione..." : "Ne-Mici"}
                    </button>,
                    document.body
                )
            }
        </>
    );
}
