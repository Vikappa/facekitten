'use client'

import ReactInput from "@/app/components/atoms/ReactInput";
import ReactionIcon from "@/app/components/atoms/ReactionIcon";
import { CommentData, ReactionData, ReactionType } from "@/lib/interfaces/CommonInterfaces";
import { useAppSelector } from "@/lib/redux/hooks";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import CommentReplyForm from "./CommentReplyForm";
import CommentReplyLi from "./CommentReplyLi";

interface CommentLiProp {
    comment: CommentData;
    postId: string;
    nowMs: number;
    navigationTarget?: {
        commentId: string;
        replyId: string | null;
        shouldAutoScroll?: boolean;
    };
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

function findReactionIndex(reactions: ReactionData[], reaction: ReactionData): number {
    const normalizedAuthorId = (reaction.authorId ?? "").trim();
    if (normalizedAuthorId.length > 0) {
        return reactions.findIndex((candidate) => candidate.authorId === normalizedAuthorId);
    }

    const normalizedReactionId = (reaction.reactionId ?? "").trim();
    if (normalizedReactionId.length > 0) {
        return reactions.findIndex((candidate) => candidate.reactionId === normalizedReactionId);
    }

    return -1;
}

export default function CommentLi({ comment, postId, nowMs, navigationTarget }: CommentLiProp) {
    const [isRepling, setIsRepling] = useState(false);
        const [isTemporarilyHighlighted, setIsTemporarilyHighlighted] = useState(false);
    const currentProfileId = useAppSelector((state) => state.profile.currentProfile?.id);
    const [optimisticCommentReactions, setOptimisticCommentReactions] = useState<ReactionData[]>(
        comment.reactions
    );
    const navigationReplyId = navigationTarget?.replyId ?? null;
    const hasNavigationTargetReply =
        navigationReplyId !== null &&
        comment.commentReplies.some((reply) => reply.commentReplyId === navigationReplyId);

    useEffect(() => {
        setOptimisticCommentReactions(comment.reactions);
    }, [comment.reactions, comment.commentId]);

    useEffect(() => {
        if (!navigationTarget) {
            return;
        }

        setIsRepling(hasNavigationTargetReply);
    }, [comment.commentId, hasNavigationTargetReply, navigationTarget]);

    const shouldHighlightCommentTarget = Boolean(navigationTarget) && !hasNavigationTargetReply;

    useEffect(() => {
        if (!shouldHighlightCommentTarget) {
            return;
        }

        setIsTemporarilyHighlighted(true);
        const timeoutId = window.setTimeout(() => {
            setIsTemporarilyHighlighted(false);
        }, 2_000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [comment.commentId, shouldHighlightCommentTarget]);

    const handleOptimisticCommentReactionChange = useCallback((payload: {
        previousReaction: ReactionData | undefined;
        nextReaction: ReactionData | undefined;
    }) => {
        setOptimisticCommentReactions((previousReactions) => {
            const nextReactions = [...previousReactions];

            if (payload.previousReaction && !payload.nextReaction) {
                const previousReactionIndex = findReactionIndex(nextReactions, payload.previousReaction);
                if (previousReactionIndex >= 0) {
                    nextReactions.splice(previousReactionIndex, 1);
                }
                return nextReactions;
            }

            if (!payload.nextReaction) {
                return nextReactions;
            }

            const previousReactionIndex = payload.previousReaction
                ? findReactionIndex(nextReactions, payload.previousReaction)
                : -1;
            if (previousReactionIndex >= 0) {
                nextReactions[previousReactionIndex] = payload.nextReaction;
                return nextReactions;
            }

            const nextReactionIndex = findReactionIndex(nextReactions, payload.nextReaction);
            if (nextReactionIndex >= 0) {
                nextReactions[nextReactionIndex] = payload.nextReaction;
                return nextReactions;
            }

            nextReactions.push(payload.nextReaction);
            return nextReactions;
        });
    }, []);

    const userCommentReaction = useMemo(
        () => findReactionFromCurrentProfile(optimisticCommentReactions, currentProfileId),
        [optimisticCommentReactions, currentProfileId]
    );
    const totalCommentReactions = optimisticCommentReactions.length;
    const previewReactionTypes = useMemo(() => {
        const uniqueTypes: ReactionType[] = [];

        for (const reaction of optimisticCommentReactions) {
            if (uniqueTypes.includes(reaction.reactionType)) {
                continue;
            }

            uniqueTypes.push(reaction.reactionType);
            if (uniqueTypes.length >= 3) {
                break;
            }
        }

        return uniqueTypes;
    }, [optimisticCommentReactions]);

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
        <div
            id={`comment-${comment.commentId}`}
            className="flex flex-col scroll-mt-28"
        >
            <div
                className={`flex gap-3 bg-tertiary rounded-full p-2 px-2 mt-3 mb-1${
                    isTemporarilyHighlighted ? "deeplink-target-highlight" : ""
                }`}
            >                
            <div className="my-auto flex h-9 w-9 shrink-0 justify-center overflow-hidden rounded-full">
                    <Image
                        src={comment.commentAuthorPropic && comment.commentAuthorPropic !== "" ? comment.commentAuthorPropic : "/assets/blankprofile.png"}
                        width={36}
                        height={36}
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
                            onOptimisticReactionChange={handleOptimisticCommentReactionChange}
                            text="Mi piace"
                            placeholer="Mi piace"
                            customSize={14}
                            className="cursor-pointer select-none"

                        />
                        {totalCommentReactions > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                                <span className="inline-flex items-center -space-x-1">
                                    {previewReactionTypes.map((reactionType, index) => (
                                        <span
                                            key={`${comment.commentId}-${reactionType}-${index}`}
                                            className="inline-flex rounded-full bg-white ring-1 ring-white"
                                        >
                                            <ReactionIcon reactionType={reactionType} size={12} />
                                        </span>
                                    ))}
                                </span>
                                <span>
                                    {totalCommentReactions} {totalCommentReactions === 1 ? "reazione" : "reazioni"}
                                </span>
                            </span>
                        )}

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
                                                isNavigationTargetReply={
                            navigationReplyId !== null &&
                            reply.commentReplyId === navigationReplyId
                        }
                    />
                ))}
            </div>
            <CommentReplyForm
                isRepling={isRepling}
                setIsRepling={setIsRepling}
                PostId={postId}
                CommentId={comment.commentId}
            />
        </div>
    );
}
