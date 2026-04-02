'use client'
import { AddCommentReduxPayload, addCommentToPost } from "@/lib/redux/homepagePostsSlice";
import { useAppDispatch } from "@/lib/redux/hooks";
import { CommentData, ReactionData } from "@/lib/interfaces/CommonInterfaces";
import { useState } from "react";
import { CiPaperplane } from "react-icons/ci";
import { BiSolidPaperPlane } from "react-icons/bi";
import { BsEmojiSmile } from "react-icons/bs";
import { CiCamera } from "react-icons/ci";
import { MdGif } from "react-icons/md";
import { LuSticker } from "react-icons/lu";
import type { FocusEvent, FormEvent, KeyboardEvent } from "react";

export interface CommentFormProps {
    postId: string
}

export default function CommentForm(props: CommentFormProps) {

    const [commentText, setCommentText] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isSendingComment, setIsSendingComment] = useState(false);
    const dispatch = useAppDispatch();


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

    function isCommentData(value: unknown): value is CommentData {
        if (typeof value !== "object" || value === null) {
            return false;
        }

        const comment = value as Record<string, unknown>;
        return (
            typeof comment.authorId === "string" &&
            typeof comment.authorName === "string" &&
            typeof comment.commentAuthorPropic === "string" &&
            typeof comment.commentedAt === "string" &&
            Array.isArray(comment.reactions) &&
            comment.reactions.every((reaction) => isReactionData(reaction)) &&
            typeof comment.reactionNumbers === "number" &&
            typeof comment.commentText === "string" &&
            Array.isArray(comment.commentReplies) &&
            typeof comment.commentRepliesCount === "number"
        );
    }

    function parseAddCommentResponse(payload: unknown): { postId: string; comment: CommentData } | null {
        if (typeof payload !== "object" || payload === null) {
            return null;
        }

        const body = payload as Record<string, unknown>;
        if (typeof body.postId !== "string" || !isCommentData(body.comment)) {
            return null;
        }

        return {
            postId: body.postId,
            comment: body.comment,
        };
    }

    async function sendComment(text: string) {
        const response = await fetch('/api/v1/post/comment/add', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                postId: props.postId,
                commentText: text,
            }),
        })

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
                    : "Invio commento fallito";
            throw new Error(message);
        }

        const parsedResponse = parseAddCommentResponse(payload);
        if (!parsedResponse) {
            throw new Error("Risposta API comment/add non valida");
        }

        const reduxActionPayload: AddCommentReduxPayload = {
            CommentData: parsedResponse.comment,
            PostId: parsedResponse.postId
        }

        dispatch(addCommentToPost(reduxActionPayload))
    }

    async function handleSubmitComment(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const normalizedCommentText = commentText.trim();
        if (isSendingComment || normalizedCommentText.length === 0) {
            return;
        }

        setIsSendingComment(true)
        try {
            await sendComment(normalizedCommentText)
            setCommentText("")
        } catch (error) {
            console.error("Errore invio commento:", error)
        } finally {
            setIsSendingComment(false)
        }
    }

    function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key !== "Enter" || event.nativeEvent.isComposing) {
            return;
        }

        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
    }

    function handleFormFocus() {
        setIsFocused(true);
    }

    function handleFormBlur(event: FocusEvent<HTMLFormElement>) {
        const nextFocusedElement = event.relatedTarget;
        if (nextFocusedElement instanceof Node && event.currentTarget.contains(nextFocusedElement)) {
            return;
        }

        setIsFocused(false);
    }

    return (
        <div className="flex flex-col bg-tertiary align-items rounded-3xl p-1 px-1.5 my-1">
            <form
                onSubmit={handleSubmitComment}
                onFocus={handleFormFocus}
                onBlur={handleFormBlur}
                className="flex w-full flex-col gap-1"
            >
                <div className="flex w-full items-center gap-2">
                    <textarea
                        id="commentInput"
                        rows={1}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={handleTextareaKeyDown}
                        readOnly={isSendingComment}
                        placeholder="Scrivi un commento..."
                        className={`appearance-none border-0 rounded-full px-3 py-1.5 w-full resize-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${isSendingComment ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
                    />
                    <button
                        type="submit"
                        aria-label="Invia commento"
                        disabled={isSendingComment || commentText.trim().length === 0}
                        className="shrink-0 p-1 text-gray-700 hover:text-primary disabled:opacity-60 flex items-center justify-center"
                    >
                        <CiPaperplane size={22} />
                    </button>
                </div>
                <div className={`flex w-full justify-content-start p-2 ${(isFocused || commentText.length > 0) ? "" : "hidden"}`}>
                    <div className="flex text-gray-500 gap-1">
                        <BsEmojiSmile />
                        <CiCamera />
                        <MdGif className="" />
                        <LuSticker />
                    </div>
                </div>
            </form>
        </div>
    )
}
