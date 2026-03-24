'use client'

import PostCard from "@/app/components/cells/posts/PostList/PostCard";
import MobileMiniNavBar from "@/app/components/cells/NavbarParts/MobileMiniNavBar";
import SideBars from "@/app/components/cells/SideBars/SideBars";
import { PostData } from "@/lib/interfaces/CommonInterfaces";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
    const { postId } = useParams<{ postId: string }>();
    const [post, setPost] = useState<PostData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const normalizedPostId = postId?.trim() ?? "";
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
    }, [postId]);

    return (
        <SideBars>
            <MobileMiniNavBar />
            <div className="mx-auto w-full max-w-2xl">
                {isLoading && (
                    <div className="grid min-h-[calc(100dvh-56px)] w-full place-items-center">
                        <span className="loaderProfilePictures -translate-y-25" aria-hidden="true"></span>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="m-3 rounded-lg bg-white p-4 text-sm text-red-600 shadow-sm">
                        {error}
                    </div>
                )}

                {!isLoading && !error && post && (
                    <PostCard data={post} />
                )}
            </div>
        </SideBars>
    );
}
