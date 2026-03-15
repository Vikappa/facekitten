'use client'

import type { FriendshipStatus } from "@/types/friendship";
import { UserProfile } from "@/lib/redux/profileSlice"
import { Database } from "@/types/database.types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaCamera } from "react-icons/fa6";

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

export default function ProfilePageHeroV2(props: ProfilePageHeroV2Props) {
    console.log(props)
    return (
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
                            props.friendshipStatus === "amico" && 
                            <button className="mb-2 w-1/2 rounded-md bg-blue-200 py-1.5 font-bold text-white">Mici</button>
                        }
                        {
                            props.friendshipStatus === "non amico" && 
                            <button className="mb-2 w-1/2 rounded-md bg-primary py-1.5 font-bold text-white">Aggiungi ai mici</button>
                        }
                        {
                            props.friendshipStatus === "richiesta inviata" && 
                            <button className="mb-2 w-1/2 rounded-md bg-secondary py-1.5 font-bold text-gray-700">Richiesta di micizia inviata</button>
                        }
                        {
                            props.friendshipStatus === "richiesta ricevuta" && 
                            <button className="mb-2 w-1/2 rounded-md bg-secondary py-1.5 font-bold text-gray-700">Accetta Richiesta Micizia</button>
                        }
                        
                        <button
                            className="mb-2 w-1/2 rounded-md bg-tertiary py-1.5 text-center font-semibold text-gra"
                        >
                            Messaggia
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}
