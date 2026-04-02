'use client'

import ReactInput from "@/app/components/atoms/ReactInput";
import ReactionIcon from "@/app/components/atoms/ReactionIcon";
import { CommentReplyData, ReactionData, ReactionType } from "@/lib/interfaces/CommonInterfaces";
import { useAppSelector } from "@/lib/redux/hooks";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

interface CommentReplyLiProps {
    replyData: CommentReplyData;
    onOpenReplyForm: () => void;
    isNavigationTargetReply?: boolean;
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

export default function CommentReplyLi({
    replyData,
    onOpenReplyForm,
    isNavigationTargetReply = false,
}: CommentReplyLiProps) {
    const currentProfileId = useAppSelector((state) => state.profile.currentProfile?.id);
    const [optimisticReplyReactions, setOptimisticReplyReactions] = useState<ReactionData[]>(
        replyData.commentReplyReactions
    );
    const [isTemporarilyHighlighted, setIsTemporarilyHighlighted] = useState(false);

    useEffect(() => {
        setOptimisticReplyReactions(replyData.commentReplyReactions);
    }, [replyData.commentReplyReactions, replyData.commentReplyId]);

    useEffect(() => {
        if (!isNavigationTargetReply) {
            return;
        }

        setIsTemporarilyHighlighted(true);
        const timeoutId = window.setTimeout(() => {
            setIsTemporarilyHighlighted(false);
        }, 2_000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isNavigationTargetReply, replyData.commentReplyId]);

    const handleOptimisticReplyReactionChange = useCallback((payload: {
        previousReaction: ReactionData | undefined;
        nextReaction: ReactionData | undefined;
    }) => {
        setOptimisticReplyReactions((previousReactions) => {
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

    const userReplyReaction = useMemo(
        () => findReactionFromCurrentProfile(optimisticReplyReactions, currentProfileId),
        [optimisticReplyReactions, currentProfileId]
    );
    const totalReplyReactions = optimisticReplyReactions.length;
    const previewReactionTypes = useMemo(() => {
        const uniqueTypes: ReactionType[] = [];

        for (const reaction of optimisticReplyReactions) {
            if (uniqueTypes.includes(reaction.reactionType)) {
                continue;
            }

            uniqueTypes.push(reaction.reactionType);
            if (uniqueTypes.length >= 3) {
                break;
            }
        }

        return uniqueTypes;
    }, [optimisticReplyReactions]);

    return (
        <div
            id={replyData.commentReplyId ? `reply-${replyData.commentReplyId}` : undefined}
            className={`my-1 px-5 ms-8 pt-2 pb-1 flex items-start bg-tertiary rounded-full scroll-mt-28 ${
                isTemporarilyHighlighted ? "deeplink-target-highlight" : ""
            }`}
        >
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 pt-1">
                    <Link className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full" href={`/profile/${replyData.authorId}`}>
                        <Image
                            src={replyData.replyAuthorPropic && replyData.replyAuthorPropic !== "" ? replyData.replyAuthorPropic : "/assets/blankprofile.png"}
                            width={20}
                            height={20}
                            alt={replyData.authorName}
                            className="h-full w-full object-cover"
                        />
                    </Link>
                    <Link className="inline-flex items-center text-sm font-semibold leading-5 text-black" href={`/profile/${replyData.authorId}`}>
                        {replyData.authorName}
                    </Link>
                    <span className="text-sm leading-5 text-gray-900">{replyData.commentReplyText}</span>
                </div>
                <div className="flex items-center text-[10px] text-gray-500 px-8">
                    <ReactInput
                        InputTemplateType={{ type: "commentReply" }}
                        ReactionData={userReplyReaction}
                        targetId={replyData.commentReplyId ?? undefined}
                        onOptimisticReactionChange={handleOptimisticReplyReactionChange}
                        text="Mi piace"
                        placeholer="Mi piace"
                        className="cursor-pointer select-none text-xs"
                        customSize={14}
                    />
                    {totalReplyReactions > 0 && (
                        <span className="inline-flex items-center gap-1 px-3 text-[10px] text-gray-500">
                            <span className="inline-flex items-center -space-x-1">
                                {previewReactionTypes.map((reactionType, index) => (
                                    <span
                                        key={`${replyData.commentReplyId ?? replyData.repliedAt}-${reactionType}-${index}`}
                                        className="inline-flex rounded-full bg-white ring-1 ring-white"
                                    >
                                        <ReactionIcon reactionType={reactionType} size={12} />
                                    </span>
                                ))}
                            </span>
                            <span>
                                {totalReplyReactions} {totalReplyReactions === 1 ? "reazione" : "reazioni"}
                            </span>
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onOpenReplyForm}
                        className="cursor-pointer select-none hover:text-blue-600"
                    >
                        Rispondi
                    </button>
                </div>
            </div>
        </div>
    );
}
