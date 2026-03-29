'use client'
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

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const normalizedCommentReplyText = commentReplyText.trim();

        if (isSendingCommentReply || normalizedCommentReplyText.length === 0) {
            return;
        }

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

            setCommentReplyText("");
            setIsRepling(false);
        } catch (error) {
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
