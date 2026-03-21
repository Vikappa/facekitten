'use client'
import PostList from "@/app/components/cells/posts/PostList/PostList";
import SideBars from "@/app/components/cells/SideBars/SideBars";
import MobileMiniNavBar from "../components/cells/NavbarParts/MobileMiniNavBar";
import { NotificationData, PostData } from "@/lib/interfaces/CommonInterfaces";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setHomepagePosts } from "@/lib/redux/homepagePostsSlice";
import { setUnreadNotifications } from "@/lib/redux/notificationsSlice";
import { useCallback, useEffect, useRef } from "react";
import PostForm from "../components/cells/posts/PostForm/PostForm";

const MIN_UPDATE_INTERVAL_MS = 60_000;
const AUTO_FETCH_INTERVAL_MS = 180_000;

const isNotificationData = (payload: unknown): payload is NotificationData => {
    if (typeof payload !== "object" || payload === null) {
        return false
    }

    const candidate = payload as Partial<NotificationData>
    return (
        typeof candidate.id === "number" &&
        typeof candidate.createdAt === "string" &&
        typeof candidate.seen === "boolean"
    )
}

type HomepageRefreshPayload = {
    posts: PostData[];
    unreadNotifications: NotificationData[];
}

const isHomepageRefreshPayload = (payload: unknown): payload is HomepageRefreshPayload => {
    if (typeof payload !== "object" || payload === null) {
        return false
    }

    const candidate = payload as Partial<HomepageRefreshPayload>
    return Array.isArray(candidate.posts) && Array.isArray(candidate.unreadNotifications)
}

export default function Home() {
    const dispatch = useAppDispatch();
    const posts = useAppSelector((state) => state.homepagePosts.posts);
    const lastUpdatedAt = useAppSelector((state) => state.homepagePosts.lastUpdatedAt);
    const isFetchingRef = useRef(false);

    const loadHomepageUpdates = useCallback(async () => {
        if (isFetchingRef.current) {
            return;
        }

        if (
            lastUpdatedAt !== null &&
            Date.now() - lastUpdatedAt < MIN_UPDATE_INTERVAL_MS
        ) {
            return;
        }

        isFetchingRef.current = true;

        try {
            const response = await fetch('/api/v1/post/get/homepage', {
                cache: 'no-store',
            })

            if (!response.ok) {
                const errorPayload = await response.json().catch(() => null)
                console.error("Errore fetch aggiornamento homepage:", response.status, errorPayload)
                return
            }

            const data = (await response.json()) as unknown
            if (!isHomepageRefreshPayload(data)) {
                console.error("Payload aggiornamento homepage non valido:", data)
                return
            }

            const unreadNotifications = data.unreadNotifications.filter(isNotificationData)
            dispatch(setHomepagePosts(data.posts))
            dispatch(setUnreadNotifications(unreadNotifications))
        } catch (e) {
            console.error("Non sono riuscito a scaricare gli aggiornamenti homepage, dettagli:", e)
        } finally {
            isFetchingRef.current = false;
        }
    }, [dispatch, lastUpdatedAt])

    useEffect(() => {
        void loadHomepageUpdates()
    }, [loadHomepageUpdates])

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            void loadHomepageUpdates()
        }, AUTO_FETCH_INTERVAL_MS)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [loadHomepageUpdates])

    return (
        <SideBars>
            <MobileMiniNavBar />
            <PostForm />
            <PostList posts={posts} />
        </SideBars>
    )
}
