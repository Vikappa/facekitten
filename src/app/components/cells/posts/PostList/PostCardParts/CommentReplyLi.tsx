'use client'

import { CommentReplyData } from "@/lib/interfaces/CommonInterfaces"
import Image from "next/image"
import Link from "next/link"

interface CommentReplyLiProps {
    replyData: CommentReplyData
    onOpenReplyForm: () => void
}

export default function CommentReplyLi({ replyData, onOpenReplyForm }: CommentReplyLiProps) {

    return (
        <div className="ms-10 my-2 flex items-start">
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <Link className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full" href={`/profile/${replyData.authorId}`}>
                        <Image
                            src={replyData?.replyAuthorPropic && replyData?.replyAuthorPropic !== "" ? replyData?.replyAuthorPropic : "/assets/blankprofile.png"}
                            width={20}
                            height={20}
                            alt={replyData.authorName}
                            className="w-full h-full object-cover"
                        />
                    </Link>
                    <Link className="inline-flex items-center text-sm font-semibold leading-5 text-black" href={`/profile/${replyData.authorId}`}>
                        {replyData.authorName}
                    </Link>
                    <span className="text-sm leading-5 text-gray-900">{replyData.commentReplyText}</span>
                </div>
                <div className="flex text-[10px] gap-3 text-gray-500" >
                    <span
                        role="button"
                        tabIndex={0}
                        onClick={onOpenReplyForm}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onOpenReplyForm();
                            }
                        }}
                        className="cursor-pointer select-none hover:text-blue-600"
                    >
                        Mi piace
                    </span>
                    <span
                        role="button"
                        tabIndex={0}
                        onClick={onOpenReplyForm}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onOpenReplyForm();
                            }
                        }}
                        className="cursor-pointer select-none hover:text-blue-600"
                    >
                        Rispondi
                    </span>
                </div>
            </div>
        </div>
    )
}
