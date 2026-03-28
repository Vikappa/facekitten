'use client'
import { BiSolidPaperPlane } from "react-icons/bi";
import { BsEmojiSmile } from "react-icons/bs";
import { CiCamera } from "react-icons/ci";
import { MdGif } from "react-icons/md";
import { LuSticker } from "react-icons/lu";

interface CommentReplyFormProps {
    CommentId: number;
    isRepling: boolean;
    setIsRepling: (val: boolean) => void
}

export default function CommentReplyForm({ CommentId, isRepling, setIsRepling }: CommentReplyFormProps) {

    return (
        <form className={`${!isRepling && `hidden`} mt-2 ms-10 bg-tertiary rounded-xl`}>
            <input className="flex w-full p-1 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 px-3" />
            <div className="flex w-full justify-content-between p-2">
                <div className="flex text-gray-500 gap-1">
                    <BsEmojiSmile />
                    <CiCamera />
                    <MdGif className="" />
                    <LuSticker />

                </div>
                <BiSolidPaperPlane className="ms-auto text-blue-600 text-xl" />
            </div>
        </form>
    )
}
