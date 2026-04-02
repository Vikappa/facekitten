'use client'

import type { ProfileMetadata, PostData } from "@/lib/interfaces/CommonInterfaces";
import {
    prependHomepagePost,
    removeHomepagePostById,
    replaceHomepagePost,
} from "@/lib/redux/homepagePostsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import type { UserProfile } from "@/lib/redux/profileSlice";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import SubPostCard from "./SubPostCard";

interface CondividiSpanProps {
    postToShare: PostData;
}

type SharePostResponse = {
    code?: string;
    post?: {
        id?: string;
        authorId?: string;
        content?: string | null;
        extraContent?: string | null;
        postType?: PostData["postType"] | null;
        createdAt?: string;
    };
    error?: string;
};

function toAuthorProfile(profile: UserProfile): ProfileMetadata {
    return {
        id: profile.id,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        confirmedAccount: profile.confirmedAccount,
        dataDiNascita: profile.dataDiNascita,
        giocattoloPreferito: profile.giocattoloPreferito,
        tipoCuccia: profile.tipoCuccia,
    };
}

function toSharedSubPostData(sourcePost: PostData): PostData {
    return {
        ...sourcePost,
        comments: [],
        commentNumber: 0,
        subPostData: null,
    };
}

function buildOptimisticSharePost(
    shareText: string,
    sourcePost: PostData,
    currentProfile: UserProfile
): PostData {
    const createdAt = new Date().toISOString();
    const temporaryPostId = `temp-share-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    return {
        postId: temporaryPostId,
        postType: "shareTextPost",
        text: shareText,
        imageUrl: currentProfile.avatarUrl,
        authorId: currentProfile.id,
        authorName: currentProfile.username,
        postedAt: createdAt,
        comments: [],
        commentNumber: 0,
        reactions: [],
        reactionsNumber: 0,
        shares: { sharePostId: 0 },
        postExtraContent: sourcePost.postId,
        authorProfile: toAuthorProfile(currentProfile),
        createdAt,
        subPostData: toSharedSubPostData(sourcePost),
    };
}

export default function CondividiSpan({ postToShare }: CondividiSpanProps) {
    const dispatch = useAppDispatch();
    const currentProfile = useAppSelector((state) => state.profile.currentProfile);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shareText, setShareText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shareError, setShareError] = useState<string | null>(null);
    const previewSubPostData = useMemo(
        () => toSharedSubPostData(postToShare),
        [postToShare]
    );

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isModalOpen]);

    async function handleSubmitShare(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isSubmitting) {
            return;
        }

        const normalizedShareText = shareText.trim();

        if (!currentProfile) {
            setShareError("Sessione utente non disponibile.");
            return;
        }

        const optimisticPost = buildOptimisticSharePost(
            normalizedShareText,
            postToShare,
            currentProfile
        );

        setIsSubmitting(true);
        setShareError(null);
        setIsModalOpen(false);
        dispatch(prependHomepagePost(optimisticPost));

        try {
            const response = await fetch("/api/v1/post/share", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sharedPostId: postToShare.postId,
                    shareText: normalizedShareText,
                }),
            });

            let payload: SharePostResponse | null = null;
            try {
                payload = (await response.json()) as SharePostResponse;
            } catch {
                payload = null;
            }

            if (!response.ok) {
                throw new Error(payload?.error ?? "Condivisione fallita");
            }

            const createdPostId = payload?.post?.id;
            if (typeof createdPostId !== "string" || createdPostId.trim().length === 0) {
                throw new Error("Risposta share non valida");
            }

            const createdAt =
                typeof payload?.post?.createdAt === "string"
                    ? payload.post.createdAt
                    : optimisticPost.postedAt;

            dispatch(
                replaceHomepagePost({
                    temporaryPostId: optimisticPost.postId,
                    post: {
                        ...optimisticPost,
                        postId: createdPostId,
                        postedAt: createdAt,
                        createdAt,
                        text:
                            typeof payload?.post?.content === "string"
                                ? payload.post.content
                                : optimisticPost.text,
                        postType: payload?.post?.postType ?? optimisticPost.postType,
                        postExtraContent:
                            typeof payload?.post?.extraContent === "string"
                                ? payload.post.extraContent
                                : optimisticPost.postExtraContent,
                    },
                })
            );

            setShareText("");
        } catch (error) {
            dispatch(removeHomepagePostById(optimisticPost.postId));
            setShareText(normalizedShareText);
            setShareError(
                error instanceof Error
                    ? error.message
                    : "Errore di rete durante la condivisione"
            );
            setIsModalOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                className="cursor-pointer select-none text-gray-500"
                onClick={() => {
                    setShareError(null);
                    setIsModalOpen(true);
                }}
            >
                Condividi
            </button>

            {isModalOpen && (
                <div
                    className="share-post-modal-backdrop-fade-in fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isSubmitting) {
                            setIsModalOpen(false);
                        }
                    }}
                >
                    <form
                        onSubmit={handleSubmitShare}
                        className="share-post-modal-panel-fade-in w-full max-w-md rounded-xl bg-white p-4 shadow-xl"
                    >
                        <h2 className="text-base font-semibold text-gray-900">
                            Condividi questo post
                        </h2>

                        <textarea
                            value={shareText}
                            onChange={(event) => setShareText(event.target.value)}
                            readOnly={isSubmitting}
                            rows={1}
                            placeholder="Prrra?"
                            className={`mt-3 w-full resize-none rounded-3xl bg-tertiary p-3 text-sm outline-none focus:ring-0 ${isSubmitting ? "cursor-not-allowed text-gray-500" : "text-gray-900"}`}
                        />
                        <div className="mt-3">
                            <SubPostCard subPostData={previewSubPostData} />
                        </div>
                        {shareError && (
                            <p className="mt-2 text-xs text-red-600">{shareError}</p>
                        )}
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {isSubmitting ? "Condivisione..." : "Condividi"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
