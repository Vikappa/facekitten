'use client'

import ReactInput from "@/app/components/atoms/ReactInput";
import { CommentData, ReactionData } from "@/lib/interfaces/CommonInterfaces";
import { useAppSelector } from "@/lib/redux/hooks";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import CommentReplyForm from "./CommentReplyForm";
import CommentReplyLi from "./CommentReplyLi";

interface CommentLiProp {
    comment: CommentData;
    nowMs: number;
}

function findReactionFromCurrentProfile(reactions: ReactionData[], profileId: string | undefined): ReactionData | undefined {
    if (!profileId) {
        return undefined;
    }

    return reactions.find((reaction) => {
        if (reaction.authorId) {
            return reaction.authorId === profileId;
        }

        return reaction.author === profileId;
    });
}

export default function CommentLi({ comment, nowMs }: CommentLiProp) {
    const [isRepling, setIsRepling] = useState(false);
    const currentProfileId = useAppSelector((state) => state.profile.currentProfile?.id);

    const userCommentReaction = useMemo(
        () => findReactionFromCurrentProfile(comment.reactions, currentProfileId),
        [comment.reactions, currentProfileId]
    );

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

    const authorProfileHref = comment.authorId.length > 0 ? `/profile/${comment.authorId}` : "/profile/";

    return (
        <div className="flex flex-col">
            <div className="flex gap-3">
                <div className="my-auto flex h-7 w-7 shrink-0 justify-center overflow-hidden rounded-full">
                    <Image
                        src={comment.commentAuthorPropic && comment.commentAuthorPropic !== "" ? comment.commentAuthorPropic : "/assets/blankprofile.png"}
                        width={28}
                        height={28}
                        alt={comment.authorName}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="my-1 flex flex-col">
                    <div className="flex items-start gap-2">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Link className="font-semibold text-black" href={authorProfileHref}>
                                    {comment.authorName}
                                </Link>
                                <span className="text-[11px] text-gray-400">{formatCommentDate(comment.commentedAt)}</span>
                            </div>
                            <span>{comment.commentText}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <ReactInput
                            InputTemplateType={{ type: "comment" }}
                            ReactionData={userCommentReaction}
                            targetId={comment.commentId}
                            text="Mi piace"
                            placeholer="Mi piace"
                            className="cursor-pointer select-none"
                        />

                        <button
                            type="button"
                            onClick={() => setIsRepling((prev) => !prev)}
                            className="cursor-pointer select-none hover:text-blue-600"
                        >
                            Rispondi
                        </button>
                    </div>
                </div>
            </div>

            <div>
                {comment.commentReplies.map((reply, index) => (
                    <CommentReplyLi
                        key={reply.commentReplyId ?? `${comment.commentId}_${index}`}
                        replyData={reply}
                        onOpenReplyForm={() => setIsRepling((prev) => !prev)}
                    />
                ))}
            </div>
            <CommentReplyForm isRepling={isRepling} setIsRepling={setIsRepling} CommentId={comment.commentId} />
        </div>
    );
}
