'use client'

import { GetFriendPostRequest } from "@/app/api/v1/post/get/friends/route"
import PostList from "@/app/components/organisms/PostList/PostList"
import ProfilePageHeroV2, { FriendUserProfile } from "@/app/components/organisms/ProfilePageHero/ProfilePageHeroV2"
import { PostData } from "@/lib/interfaces/CommonInterfaces"
import { prependHomepagePosts } from "@/lib/redux/homepagePostsSlice"
import { useAppSelector } from "@/lib/redux/hooks"
import { Database } from "@/types/database.types"
import {
    FRIENDSHIP_STATUS,
    isFriendshipStatus,
    type FriendshipStatus,
    type WithFriendshipStatus,
} from "@/types/friendship"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"

type ProfileGetPayload = {
    id: string
    email: string
    username: string
    avatarUrl: string
    bannerUrl: string
    bio: string
    confirmedAccount: boolean
    giocattoloPreferito?: string | null
    dataDiNascita?: string | null
    tipoCuccia?: Database["public"]["Enums"]["Lettino"] | null
    locationId?: string | null
}

type ProfileGetSuccessResponse = WithFriendshipStatus & {
    code: "PROFILE_DATA_OK"
    profile: ProfileGetPayload
}

type ProfileGetErrorResponse = {
    code?: string
    error?: string
}

function isProfileGetSuccessResponse(payload: unknown): payload is ProfileGetSuccessResponse {
    if (typeof payload !== "object" || payload === null) {
        return false
    }

    const candidate = payload as Partial<ProfileGetSuccessResponse>
    if (candidate.code !== "PROFILE_DATA_OK") {
        return false
    }

    const profile = candidate.profile as Partial<ProfileGetPayload> | undefined
    return Boolean(
        profile &&
        typeof profile.id === "string" &&
        typeof profile.email === "string" &&
        typeof profile.username === "string" &&
        typeof profile.avatarUrl === "string" &&
        typeof profile.bannerUrl === "string" &&
        typeof profile.bio === "string" &&
        typeof profile.confirmedAccount === "boolean" &&
        isFriendshipStatus(candidate.friendshipStatus) &&
        (profile.locationId === undefined ||
            profile.locationId === null ||
            typeof profile.locationId === "string")
    )
}

function parseUtilDate(rawDate: string | null | undefined): string | null {
    const normalizedDate = rawDate?.trim()
    if (!normalizedDate) {
        return null
    }

    const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalizedDate)
    if (ymdMatch) {
        const year = Number(ymdMatch[1])
        const month = Number(ymdMatch[2])
        const day = Number(ymdMatch[3])
        const parsedDate = new Date(year, month - 1, day)

        if (
            !Number.isNaN(parsedDate.getTime()) &&
            parsedDate.getFullYear() === year &&
            parsedDate.getMonth() === month - 1 &&
            parsedDate.getDate() === day
        ) {
            return new Intl.DateTimeFormat("it-IT", {
                year: "numeric",
                month: "long",
                day: "2-digit",
            }).format(parsedDate)
        }
    }

    const parsedDate = new Date(normalizedDate)
    if (Number.isNaN(parsedDate.getTime())) {
        return normalizedDate
    }

    return new Intl.DateTimeFormat("it-IT", {
        year: "numeric",
        month: "long",
        day: "2-digit",
    }).format(parsedDate)
}

export default function ViewUserProfilePage() {
    const { profileId } = useParams<{ profileId: string }>()
    const [renderedProfile, setRenderedProfile] = useState<FriendUserProfile | undefined>(undefined)
    const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>(
        FRIENDSHIP_STATUS.NON_AMICO
    )
    const postData = useAppSelector((state) => state.homepagePosts.posts.filter(p => p.authorId == profileId))
    const AlreadyDownloadedPosts = useAppSelector((state) => state.homepagePosts.posts.filter(p => p.authorId === profileId)).map(p => p.postId)
    const dispatch = useDispatch()
    async function getProfileData() {
        if (profileId && profileId.trim() !== "") {
            try {
                const response = await fetch("/profile/get?id=" + profileId, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })

                let payload: unknown = null
                try {
                    payload = await response.json()
                } catch {
                    payload = null
                }

                if (!response.ok) {
                    const errorPayload = (payload as ProfileGetErrorResponse | null) ?? null
                    console.error(errorPayload?.error ?? "Errore nel recupero del profilo")
                    return
                }

                if (!isProfileGetSuccessResponse(payload)) {
                    console.error("Risposta profilo non valida")
                    return
                }

                setRenderedProfile({
                    ...payload.profile,
                    dataDiNascita: parseUtilDate(payload.profile.dataDiNascita),
                    giocattoloPreferito: payload.profile.giocattoloPreferito ?? "",
                    locationId: payload.profile.locationId ?? "",
                    tipoCuccia: payload.profile.tipoCuccia ?? null,
                })
                setFriendshipStatus(payload.friendshipStatus)
            } catch (error) {
                console.error("Errore di rete durante il recupero del profilo", error)
            }
        }
    }

    async function FetchProfilePosts() {
        if (!profileId || profileId.trim() === "") {
            return
        }

        const requestPayload: GetFriendPostRequest = {
            friendId: profileId,
            alreadyGotPosts: AlreadyDownloadedPosts
        }

        try {
            const response = await fetch("/api/v1/post/get/friends/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestPayload),
            })

            let payload: unknown = null
            try {
                payload = await response.json()
            } catch {
                payload = null
            }

            if (!response.ok) {
                const errorPayload = payload as { error?: string } | null
                console.error(errorPayload?.error ?? "Errore nel recupero post profilo")
                return
            }

            if (!Array.isArray(payload)) {
                console.error("Risposta post non valida")
                return
            }

            dispatch(prependHomepagePosts(payload as PostData[]));
        } catch (error) {
            console.error("Errore di rete durante il recupero post profilo", error)
        }

    }

    useEffect(() => {
        void FetchProfilePosts()
        void getProfileData()
    },
        [profileId])

    return (
        <div className="flex flex-col">
            <ProfilePageHeroV2 userToRender={renderedProfile} friendshipStatus={friendshipStatus} />
            <PostList posts={postData} />
        </div>
    )
}
