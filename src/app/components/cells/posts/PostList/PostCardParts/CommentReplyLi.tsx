'use client'

import { CommentReplyData } from "@/lib/interfaces/CommonInterfaces"
import Image from "next/image"
import Link from "next/link"

interface CommentReplyLiProps {
    replyData: CommentReplyData
}

export default function CommentReplyLi({ replyData }: CommentReplyLiProps) {

    return (
        <div className="ms-10 flex items-center gap-2">
            <Link className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full" href={`/profile/${replyData.authorId}`}>
                <Image
                    src={replyData?.replyAuthorPropic && replyData?.replyAuthorPropic !== "" ? replyData?.replyAuthorPropic : "/assets/blankprofile.png"}
                    width={20}
                    height={20}
                    alt={replyData.authorName}
                    className="w-full h-full object-cover"
                />
            </Link>
            <Link  className="leading-none font-semibold" href={`/profile/${replyData.authorId}`}>{replyData.authorName}</Link>
            <span className="text-sm">{replyData.commentReplyText}</span>
        </div>
    )
}
