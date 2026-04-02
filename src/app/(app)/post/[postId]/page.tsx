'use client'

import PostCard from "@/app/components/cells/posts/PostCard";
import MobileMiniNavBar from "@/app/components/cells/NavbarParts/MobileMiniNavBar";
import SideBars from "@/app/components/cells/SideBars/SideBars";
import { PostData } from "@/lib/interfaces/CommonInterfaces";
import { resolvePostNavigationTarget } from "@/lib/navigation/postNavigationResolver";
import { prependHomepagePost } from "@/lib/redux/homepagePostsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function isPostData(value: unknown): value is PostData {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const post = value as Partial<PostData>;
    return (
        typeof post.postId === "string" &&
        typeof post.postType === "string" &&
        typeof post.text === "string" &&
        typeof post.authorId === "string" &&
        typeof post.authorName === "string" &&
        typeof post.postedAt === "string" &&
        Array.isArray(post.comments) &&
        typeof post.commentNumber === "number" &&
        Array.isArray(post.reactions) &&
        typeof post.reactionsNumber === "number" &&
        typeof post.shares === "object" &&
        post.shares !== null
    );
}

export default function SinglePostPage() {
    const dispatch = useAppDispatch();
    const { postId } = useParams<{ postId: string }>();
    const normalizedRoutePostId = postId?.trim() ?? "";
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const navigationSearchKey = searchParams.toString();
    const [post, setPost] = useState<PostData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const reduxPost = useAppSelector((state) =>
        state.homepagePosts.posts.find((candidate) => candidate.postId === normalizedRoutePostId) ?? null
    );

    const navigationTarget = useMemo(() => {
        const normalizedPostId = normalizedRoutePostId;
        if (normalizedPostId.length === 0) {
            return undefined;
        }

        const currentNavigation = `${pathname}${searchParams.toString().length > 0 ? `?${searchParams.toString()}` : ""}`;
        const resolvedNavigation = resolvePostNavigationTarget(currentNavigation);
        if (!resolvedNavigation || resolvedNavigation.postId !== normalizedPostId) {
            return undefined;
        }

        if (!resolvedNavigation.commentId && !resolvedNavigation.replyId) {
            return undefined;
        }

        return {
            commentId: resolvedNavigation.commentId,
            replyId: resolvedNavigation.replyId,
            shouldAutoScroll: true,
        };
    }, [navigationSearchKey, normalizedRoutePostId, pathname, searchParams]);

    useEffect(() => {
        const normalizedPostId = normalizedRoutePostId;
        if (normalizedPostId.length === 0) {
            setError("Post non valido");
            setIsLoading(false);
            return;
        }

        let isCancelled = false;
        const fetchPost = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/v1/post/get?id=${encodeURIComponent(normalizedPostId)}`, {
                    method: "POST",
                    cache: "no-store",
                });

                const payload = await response.json().catch(() => null);
                if (!response.ok) {
                    const message =
                        typeof payload?.error === "string"
                            ? payload.error
                            : "Impossibile caricare il post";
                    if (!isCancelled) {
                        setError(message);
                    }
                    return;
                }

                if (!isPostData(payload)) {
                    if (!isCancelled) {
                        setError("Risposta post non valida");
                    }
                    return;
                }

                if (!isCancelled) {
                    setPost(payload);
                    dispatch(prependHomepagePost(payload));
                }
            } catch (fetchError) {
                if (!isCancelled) {
                    console.error("Errore fetch post singolo:", fetchError);
                    setError("Errore di rete nel caricamento del post");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        void fetchPost();

        return () => {
            isCancelled = true;
        };
    }, [dispatch, navigationSearchKey, normalizedRoutePostId]);

    const renderedPost = reduxPost ?? post;

    return (
        <SideBars>
            <MobileMiniNavBar />
            <div className="mx-auto w-full max-w-2xl">
                {isLoading && !renderedPost && (
                    <div className="grid min-h-[calc(100dvh-56px)] w-full place-items-center">
                        <span className="loaderProfilePictures -translate-y-25" aria-hidden="true"></span>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="m-3 rounded-lg bg-white p-4 text-sm text-red-600 shadow-sm">
                        {error}
                    </div>
                )}

                {!isLoading && !error && renderedPost && (
                    <PostCard
                        data={renderedPost}
                        navigationTarget={navigationTarget}
                    />
                )}
            </div>
        </SideBars>
    );
}
