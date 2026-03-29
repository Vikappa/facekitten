'use client'
import { CommentReplyData, ReactionData } from "@/lib/interfaces/CommonInterfaces";
import {
    addCommentReplyToComment,
    removeCommentReplyFromComment,
    replaceCommentReplyInComment,
} from "@/lib/redux/homepagePostsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { BiSolidPaperPlane } from "react-icons/bi";
import { BsEmojiSmile } from "react-icons/bs";
import { CiCamera } from "react-icons/ci";
import { MdGif } from "react-icons/md";
import { LuSticker } from "react-icons/lu";
import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

interface CommentReplyFormProps {
    CommentId: string;
    isRepling: boolean;
    setIsRepling: (val: boolean) => void
}

export default function CommentReplyForm({ CommentId, isRepling, setIsRepling }: CommentReplyFormProps) {
    const [commentReplyText, setCommentReplyText] = useState("");
    const [isSendingCommentReply, setIsSendingCommentReply] = useState(false);
    const dispatch = useAppDispatch();
    const currentProfile = useAppSelector((state) => state.profile.currentProfile);

    function isReactionData(value: unknown): value is ReactionData {
        if (typeof value !== "object" || value === null) {
            return false;
        }

        const reaction = value as Record<string, unknown>;
        return (
            typeof reaction.reactionId === "string" &&
            typeof reaction.author === "string" &&
            typeof reaction.reactionType === "number"
        );
    }

    function isCommentReplyData(value: unknown): value is CommentReplyData {
        if (typeof value !== "object" || value === null) {
            return false;
        }

        const reply = value as Record<string, unknown>;
        return (
            typeof reply.authorId === "string" &&
            typeof reply.authorName === "string" &&
            typeof reply.replyAuthorPropic === "string" &&
            typeof reply.repliedAt === "string" &&
            Array.isArray(reply.commentReplyReactions) &&
            reply.commentReplyReactions.every((reaction) => isReactionData(reaction))
        );
    }

    function parseAddCommentReplyResponse(
        payload: unknown
    ): { commentId: string; reply: CommentReplyData } | null {
        if (typeof payload !== "object" || payload === null) {
            return null;
        }

        const body = payload as Record<string, unknown>;
        if (typeof body.commentId !== "string" || !isCommentReplyData(body.reply)) {
            return null;
        }

        return {
            commentId: body.commentId,
            reply: body.reply,
        };
    }

    function createOptimisticReply(commentId: string, text: string): {
        tempReplyId: string;
        reply: CommentReplyData;
    } {
        const nowIso = new Date().toISOString();
        const tempReplyId = `temp-reply-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

        return {
            tempReplyId,
            reply: {
                commentReplyId: tempReplyId,
                repliedCommentId: commentId,
                authorId: currentProfile?.id ?? "",
                authorName: currentProfile?.username ?? "Tu",
                replyAuthorPropic: currentProfile?.avatarUrl ?? "/assets/blankprofile.png",
                repliedAt: nowIso,
                commentReplyText: text,
                createdAt: nowIso,
                commentReplyReactions: [],
            },
        };
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const normalizedCommentReplyText = commentReplyText.trim();

        if (isSendingCommentReply || normalizedCommentReplyText.length === 0) {
            return;
        }

        const optimisticReply = createOptimisticReply(CommentId, normalizedCommentReplyText);
        dispatch(
            addCommentReplyToComment({
                CommentId,
                CommentReplyData: optimisticReply.reply,
            })
        );
        setCommentReplyText("");
        setIsRepling(false);
        setIsSendingCommentReply(true);

        try {
            const response = await fetch("/api/v1/post/comment/reply/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    commentId: CommentId,
                    commentReplyText: normalizedCommentReplyText,
                }),
            });

            let payload: unknown = null;
            try {
                payload = await response.json();
            } catch {
                payload = null;
            }

            if (!response.ok) {
                const message =
                    typeof payload === "object" &&
                    payload !== null &&
                    typeof (payload as Record<string, unknown>).error === "string"
                        ? (payload as Record<string, string>).error
                        : "Invio reply fallito";
                throw new Error(message);
            }

            const parsedResponse = parseAddCommentReplyResponse(payload);
            if (!parsedResponse) {
                throw new Error("Risposta API comment/reply/add non valida");
            }

            dispatch(
                replaceCommentReplyInComment({
                    CommentId: parsedResponse.commentId,
                    TempCommentReplyId: optimisticReply.tempReplyId,
                    CommentReplyData: parsedResponse.reply,
                })
            );
        } catch (error) {
            dispatch(
                removeCommentReplyFromComment({
                    CommentId,
                    CommentReplyId: optimisticReply.tempReplyId,
                })
            );
            setCommentReplyText(normalizedCommentReplyText);
            setIsRepling(true);
            console.error("Errore invio reply commento:", error);
        } finally {
            setIsSendingCommentReply(false);
        }
    }

    function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
    }

    return (
        <form className={`${!isRepling && `hidden`} mt-2 ms-10 bg-tertiary rounded-xl`} onSubmit={handleSubmit} >
            <input
                type="text"
                value={commentReplyText}
                onChange={(event) => setCommentReplyText(event.target.value)}
                readOnly={isSendingCommentReply}
                onKeyDown={handleInputKeyDown}
                className={`flex w-full p-1 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 px-3 ${isSendingCommentReply ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
            />
            <div className="flex w-full justify-content-between p-2">
                <div className="flex text-gray-500 gap-1">
                    <BsEmojiSmile />
                    <CiCamera />
                    <MdGif className="" />
                    <LuSticker />

                </div>
                <button
                    type="submit"
                    disabled={isSendingCommentReply || commentReplyText.trim().length === 0}
                    className="ms-auto text-blue-600 text-xl disabled:opacity-60"
                >
                    <BiSolidPaperPlane />
                </button>
            </div>
        </form>
    )
}
