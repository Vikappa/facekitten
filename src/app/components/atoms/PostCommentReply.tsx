'use client'

import { FaceKittenDB, IPostComment, IPostCommentReply, IProfile } from "@/lib/db";
import { usePostCommentRepliesByPostCommentId } from "@/lib/dbHooks";
import { formatRelativeTime } from "@/lib/utils";
import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from "react";
import { EmojiMart } from "./EmojiMart";
import { CiFaceSmile } from "react-icons/ci";
import Image from "next/image";

interface PostCommentReplyProps {
    currentNewReply: string;
    setCurrentNewReply: Dispatch<SetStateAction<string>>;
    setIsRepling: Dispatch<SetStateAction<boolean>>;
    db: FaceKittenDB;
    comment: IPostComment;
    onReplyAdded: () => void;
}

interface ReplyModel {
    content: IPostCommentReply;
    replyAuthor: IProfile;
}

export function PostCommentReply({
    currentNewReply,
    setCurrentNewReply,
    setIsRepling,
    db,
    comment,
    onReplyAdded
}: PostCommentReplyProps) {

    const replies: IPostCommentReply[] | undefined = usePostCommentRepliesByPostCommentId(comment.id);
    const [replyModels, setReplyModels] = useState<ReplyModel[]>([]);

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // click fuori dal form → reset + chiudi
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target as Node)) {
                setCurrentNewReply("");
                setIsRepling(false);
            }
        }

        document.addEventListener("pointerdown", handleClickOutside);
        return () => {
            document.removeEventListener("pointerdown", handleClickOutside);
        };
    }, [setIsRepling, setCurrentNewReply]);

    useEffect(() => {
        async function FetchData() {
            if (replies) {
                const repModels: ReplyModel[] = await Promise.all(
                    replies.map(async r => {
                        const a: IProfile | undefined = await db.profiles.get(r.authorId);
                        if (!a || !a.id) throw new Error("");
                        return {
                            content: r,
                            replyAuthor: a
                        };
                    })
                );
                setReplyModels(repModels);
            }
        }
        FetchData();
    }, [replies, db]);

    async function addReplyToComment(
        e: FormEvent<HTMLFormElement>,
        currentNewReply: string,
        setCurrentNewReply: Dispatch<SetStateAction<string>>,
        setIsRepling: Dispatch<SetStateAction<boolean>>
    ) {
        e.preventDefault();

        const trimmed = currentNewReply.trim();
        if (!trimmed) return;

        const newUid = crypto.randomUUID();
        const NewReply: IPostCommentReply = {
            id: newUid,
            postCommentId: comment.id,
            authorId: "0",
            content: trimmed,
            createdAt: new Date(),
            commentReactionsIds: []
        };

        await db.replies.add(NewReply);
        if (!comment?.repliesIds) comment.repliesIds = [];
        comment.repliesIds.push(newUid);
        await db.comments.put(comment);
        onReplyAdded();

        setIsRepling(false);
        setCurrentNewReply("");
    }

    return (
        <div className="flex flex-col" ref={wrapperRef}>
            {replyModels && replyModels.length > 0 && replyModels.map(r => (
                <div
                    className="text-xs flex items-center bg-gray-100 rounded-md p-1 px-2 my-1 gap-1"
                    key={r.content.id}
                >

                    <span className="text-gray-500 text-[10px] font-semibold">
                        {formatRelativeTime(r.content.createdAt.toString())}
                    </span>
                    <div className="overflow-hidden rounded-full w-4 h-4 flex-shrink-0">
                        <Image
                            className="object-cover w-full h-full"
                            src={r.replyAuthor.avatarUrl}
                            alt={r.replyAuthor.username}
                            width={12}
                            height={12}
                            unoptimized
                        />
                    </div>

                    <span className="font-semibold text-gray-700">{r.replyAuthor.username}</span>

                    <span className="text-gray-900">{r.content.content}</span>
                </div>

            ))}

            <form
                className="relative focus:ring-0 flex align-middle gap-2 bg-gray-100 rounded-full pe-2 mt-2 text-sm py-1"
                onSubmit={(e) => addReplyToComment(e, currentNewReply, setCurrentNewReply, setIsRepling)}
            >
                <input
                    ref={inputRef}
                    placeholder="Come rispondi?"
                    value={currentNewReply}
                    onChange={(e) => { setCurrentNewReply(e.target.value) }}
                    className="p-0 px-3 w-full focus:outline-none focus:ring-0 flex-1 bg-transparent"
                />

                <CiFaceSmile
                    className="text-gray-500 cursor-pointer"
                    style={{ margin: 'auto 0' }}
                    size={16}
                    onClick={() => {
                        setIsRepling(true);

                        setShowEmojiPicker(prev => !prev)
                        setShowEmojiPicker(true);

                        requestAnimationFrame(() => {
                            inputRef.current?.focus();
                        });
                    }}
                />


                {showEmojiPicker && (
                    <EmojiMart
                        inputRef={inputRef}
                        value={currentNewReply}
                        onChange={setCurrentNewReply}
                        onClose={() => setShowEmojiPicker(false)}
                    />
                )}
            </form>
        </div>
    );

}
