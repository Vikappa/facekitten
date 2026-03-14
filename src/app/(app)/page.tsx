'use client'
import PostForm from "@/app/components/organisms/PostForm/PostForm";
import PostList from "@/app/components/organisms/PostList/PostList";
import SideBars from "@/app/components/organisms/SideBars/SideBars";
import MobileMiniNavBar from "../components/organisms/NavbarParts/MobileMiniNavBar";
import { PostData } from "@/lib/interfaces/CommonInterfaces";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setHomepagePosts } from "@/lib/redux/homepagePostsSlice";
import { useCallback, useEffect, useRef } from "react";

const MIN_UPDATE_INTERVAL_MS = 60_000;
const AUTO_FETCH_INTERVAL_MS = 180_000;

export default function Home() {
    const dispatch = useAppDispatch();
    const posts = useAppSelector((state) => state.homepagePosts.posts);
    const lastUpdatedAt = useAppSelector((state) => state.homepagePosts.lastUpdatedAt);
    const isFetchingRef = useRef(false);

    const loadHomepagePosts = useCallback(async () => {
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
                console.error("Errore fetch homepage posts:", response.status, errorPayload)
                return
            }

            const data = (await response.json()) as unknown
            dispatch(setHomepagePosts(Array.isArray(data) ? (data as PostData[]) : []))
        } catch (e) {
            console.error("Non sono riuscito a scaricare i post, dettagli:", e)
        } finally {
            isFetchingRef.current = false;
        }
    }, [dispatch, lastUpdatedAt])

    useEffect(() => {
        void loadHomepagePosts()
    }, [loadHomepagePosts])

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            void loadHomepagePosts()
        }, AUTO_FETCH_INTERVAL_MS)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [loadHomepagePosts])

    return (
        <SideBars>
            <MobileMiniNavBar />
            <PostForm />
            <PostList posts={posts} />
        </SideBars>
    )
}
