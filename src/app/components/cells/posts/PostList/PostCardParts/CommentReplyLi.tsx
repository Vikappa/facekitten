'use client'

import ReactInput from "@/app/components/atoms/ReactInput";
import { CommentReplyData, ReactionData } from "@/lib/interfaces/CommonInterfaces";
import { useAppSelector } from "@/lib/redux/hooks";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

interface CommentReplyLiProps {
    replyData: CommentReplyData;
    onOpenReplyForm: () => void;
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

export default function CommentReplyLi({ replyData, onOpenReplyForm }: CommentReplyLiProps) {
    const currentProfileId = useAppSelector((state) => state.profile.currentProfile?.id);

    const userReplyReaction = useMemo(
        () => findReactionFromCurrentProfile(replyData.commentReplyReactions, currentProfileId),
        [replyData.commentReplyReactions, currentProfileId]
    );

    return (
        <div className="my-2 ms-10 flex items-start">
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
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
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <ReactInput
                        InputTemplateType={{ type: "commentReply" }}
                        ReactionData={userReplyReaction}
                        targetId={replyData.commentReplyId ?? undefined}
                        text="Mi piace"
                        placeholer="Mi piace"
                        className="cursor-pointer select-none text-xs"
                    />

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
