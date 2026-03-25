'use client'

import { CommentData } from "@/lib/interfaces/CommonInterfaces"
import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"

interface CommentLiProp {
    comment: CommentData
    nowMs: number
}

export default function CommentLi({ comment, nowMs }: CommentLiProp) {

    function formatCommentDate(commentedAt: string): ReactNode {
        const commentDate = new Date(commentedAt);
        if (Number.isNaN(commentDate.getTime())) {
            return commentedAt;
        }

        const diffMs = nowMs - commentDate.getTime();
        const minuteMs = 60 * 1000;
        const hourMs = 60 * minuteMs;
        const dayMs = 24 * hourMs;

        if (diffMs < -minuteMs) {
            return (
                <span className="future-post-rainbow">
                    questo commento arriva dal futuro!!
                </span>
            );
        }

        if (Math.abs(diffMs) < minuteMs) {
            return "Adesso";
        }

        if (diffMs < hourMs) {
            const minutes = Math.floor(diffMs / minuteMs);
            return minutes === 1 ? "1 minuto fa" : `${minutes} minuti fa`;
        }

        if (diffMs < dayMs) {
            const hours = Math.floor(diffMs / hourMs);
            return hours === 1 ? "1 ora fa" : `${hours} ore fa`;
        }

        return new Intl.DateTimeFormat("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(commentDate);
    }

    const authorProfileHref = comment.authorId.length > 0 ? `/profile/${comment.authorId}` : "/profile/"

    return (
        <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex flex-column justify-content-center justify-center my-auto">
                <Image
                    src={comment.commentAuthorPropic ?? "/assets/blankprofile.png"}
                    width={28}
                    height={28}
                    alt={comment.authorName}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex flex-col my-1">
                <div className="flex items-start gap-2">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Link className="text-black font-semibold" href={authorProfileHref}>
                                {comment.authorName}
                            </Link>
                            <span className="text-[11px] text-gray-400">{formatCommentDate(comment.commentedAt)}</span>
                        </div>
                        <span>{comment.commentText}</span>
                    </div>

                </div>
                <div className="flex flex-col">
                    <div className="flex text-[10px] gap-3 text-gray-500">
                        <span>Mi piace</span>
                        <span>Rispondi</span>
                    </div>
                    <div className="flex">
                        
                    </div>
                </div>
            </div>
        </div>
    )
}
