'use client'

import { PostData } from "@/lib/interfaces/CommonInterfaces"
import { useAppSelector } from "@/lib/redux/hooks"
import Image from "next/image"
import Link from "next/link"
import ReactionCount from "./PostCardParts/ReactionCount"
import ShareCount from "./PostCardParts/ShareCount"
import ReactionSpan from "./PostCardParts/ReactionSpan"
import CommentSpan from "./PostCardParts/CommentSpan"
import CondividiSpan from "./PostCardParts/CondividiSpan"
import { ReactNode, useEffect, useState } from "react"
import CommentForm from "../CommentForm"
import CommentList from "./PostCardParts/CommentList"

interface PostCardProp {
    data:PostData
    nowMs?: number
}

export default function PostCard(prop: PostCardProp) {

    const userId = useAppSelector((state) => state.profile.currentProfile?.id)
    const [isCommenting, setIsCommenting] = useState(false)
    const [fallbackNowMs, setFallbackNowMs] = useState(() => Date.now());
    const effectiveNowMs = prop.nowMs ?? fallbackNowMs;

    function toggleIsCommenting(){
        setIsCommenting(!isCommenting)
    }

    useEffect(() => {
        if (prop.nowMs !== undefined) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setFallbackNowMs(Date.now());
        }, 15_000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [prop.nowMs]);

    function formatPostDate(postedAt: string): ReactNode {
        const postDate = new Date(postedAt);
        if (Number.isNaN(postDate.getTime())) {
            return postedAt;
        }

        const diffMs = effectiveNowMs - postDate.getTime();
        const minuteMs = 60 * 1000;
        const hourMs = 60 * minuteMs;
        const dayMs = 24 * hourMs;

        if (diffMs < -minuteMs) {
            return (
                <span className="future-post-rainbow">
                    questo post arriva dal futuro!!
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
        }).format(postDate);
    }

    return (
        <div className="flex flex-col shadow-sm bg-white m-2 rounded-md p-2 mb-0">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                    <Image
                        src={prop.data.imageUrl && prop.data.imageUrl !== "" ? prop.data.imageUrl : "/assets/blankprofile.png"}
                        alt={prop.data.authorName ?? ""}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex items-baseline gap-2">
                    <Link className="text-center text-black font-semibold" href={prop.data.authorId === userId ? `/profile/` : `/profile/${prop.data.authorId}`}>{prop.data.authorName}</Link>
                    <span className="text-[11px] text-gray-400">{formatPostDate(prop.data.postedAt)}</span>
                </div>
            </div>
            <div className="p-2">
                <p>{prop.data.text}</p>
            </div>
            <div className="flex w-100">
                <ReactionCount reactionData={prop.data.reactions} reactionCount={prop.data.reactionsNumber} />
                <ShareCount {...prop.data.shares} />
            </div>
            <div className="flex w-full text-gray-900 text-sm">
                <ReactionSpan reactData={prop.data.reactions} />
                <CommentSpan isCommenting={isCommenting} updateSetIsCommenting={toggleIsCommenting} commentsCount={prop.data.commentNumber} />
                <CondividiSpan />
            </div>
            {isCommenting && <CommentForm postId={prop.data.postId} />}
            {isCommenting && <CommentList commentData={prop.data.comments} nowMs={effectiveNowMs} />}
            
        </div>
    )
}
