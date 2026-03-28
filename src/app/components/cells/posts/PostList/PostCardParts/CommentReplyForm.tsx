'use client'
import { BiSolidPaperPlane } from "react-icons/bi";
import { BsEmojiSmile } from "react-icons/bs";
import { CiCamera } from "react-icons/ci";
import { MdGif } from "react-icons/md";
import { LuSticker } from "react-icons/lu";
import type { FormEvent, KeyboardEvent } from "react";

interface CommentReplyFormProps {
    CommentId: string;
    isRepling: boolean;
    setIsRepling: (val: boolean) => void
}

export default function CommentReplyForm({ CommentId, isRepling, setIsRepling }: CommentReplyFormProps) {

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
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
                onKeyDown={handleInputKeyDown}
                className="flex w-full p-1 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 px-3"
            />
            <div className="flex w-full justify-content-between p-2">
                <div className="flex text-gray-500 gap-1">
                    <BsEmojiSmile />
                    <CiCamera />
                    <MdGif className="" />
                    <LuSticker />

                </div>
                <button type="submit" className="ms-auto text-blue-600 text-xl">
                    <BiSolidPaperPlane />
                </button>
            </div>
        </form>
    )
}
