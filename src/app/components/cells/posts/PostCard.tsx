'use client'

import { PostData, ReactionData } from "@/lib/interfaces/CommonInterfaces"
import { useAppSelector } from "@/lib/redux/hooks"
import Image from "next/image"
import Link from "next/link"
import ReactionCount from "./PostList/PostCardParts/ReactionCount"
import ShareCount from "./PostList/PostCardParts/ShareCount"
import CommentSpan from "./PostList/PostCardParts/CommentSpan"
import CondividiSpan from "./PostList/PostCardParts/CondividiSpan"
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import CommentForm from "./CommentForm"
import CommentList from "./PostList/PostCardParts/CommentList"
import ReactInput from "@/app/components/atoms/ReactInput"

type PostCardNavigationTarget = {
    commentId: string | null;
    replyId: string | null;
    shouldAutoScroll?: boolean;
};

interface PostCardProp {
    data:PostData
    nowMs?: number
    navigationTarget?: PostCardNavigationTarget
}

function findReactionFromCurrentProfile(reactions: ReactionData[], profileId: string | undefined): ReactionData | undefined {
    if (!profileId) {
        return undefined;
    }

    return reactions.find((reaction) => reaction.authorId === profileId);
}

export default function PostCard(prop: PostCardProp) {

    const userId = useAppSelector((state) => state.profile.currentProfile?.id)
    const [isCommenting, setIsCommenting] = useState(false)
    const [fallbackNowMs, setFallbackNowMs] = useState(() => Date.now());
    const effectiveNowMs = prop.nowMs ?? fallbackNowMs;
    const userPostReaction = useMemo(
        () => findReactionFromCurrentProfile(prop.data.reactions, userId),
        [prop.data.reactions, userId]
    );
    const [optimisticUserPostReaction, setOptimisticUserPostReaction] = useState<ReactionData | undefined>(userPostReaction);
    const [optimisticReactionsCount, setOptimisticReactionsCount] = useState(prop.data.reactionsNumber);
    const scrolledNavigationKeyRef = useRef<string>("");

    const resolvedNavigationTarget = useMemo(() => {
        const rawCommentId = prop.navigationTarget?.commentId ?? null;
        const rawReplyId = prop.navigationTarget?.replyId ?? null;
        const commentId = typeof rawCommentId === "string" && rawCommentId.trim().length > 0
            ? rawCommentId
            : null;
        const replyId = typeof rawReplyId === "string" && rawReplyId.trim().length > 0
            ? rawReplyId
            : null;

        if (!commentId && !replyId) {
            return undefined;
        }

        const commentIds = new Set(prop.data.comments.map((comment) => comment.commentId));

        let targetCommentId = commentId;
        if (replyId) {
            const commentWithTargetReply = prop.data.comments.find((comment) =>
                comment.commentReplies.some((reply) => reply.commentReplyId === replyId)
            );

            if (commentWithTargetReply) {
                targetCommentId = commentWithTargetReply.commentId;
            } else if (!targetCommentId) {
                return undefined;
            }
        }

        if (!targetCommentId || !commentIds.has(targetCommentId)) {
            return undefined;
        }

        return {
            commentId: targetCommentId,
            replyId,
            shouldAutoScroll: prop.navigationTarget?.shouldAutoScroll === true,
        };
    }, [prop.data.comments, prop.navigationTarget?.commentId, prop.navigationTarget?.replyId, prop.navigationTarget?.shouldAutoScroll]);

    const hasNavigationTarget = Boolean(resolvedNavigationTarget);

    function toggleIsCommenting(){
        setIsCommenting(!isCommenting)
    }

    const handleOptimisticPostReactionChange = useCallback((payload: {
        previousReaction: ReactionData | undefined;
        nextReaction: ReactionData | undefined;
    }) => {
        setOptimisticUserPostReaction(payload.nextReaction);
        setOptimisticReactionsCount((previousCount) => {
            const isAddingReaction = !payload.previousReaction && !!payload.nextReaction;
            const isRemovingReaction = !!payload.previousReaction && !payload.nextReaction;

            if (isAddingReaction) {
                return previousCount + 1;
            }

            if (isRemovingReaction) {
                return Math.max(0, previousCount - 1);
            }

            return previousCount;
        });
    }, []);

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

    useEffect(() => {
        setOptimisticUserPostReaction(userPostReaction);
    }, [userPostReaction, prop.data.postId]);

    useEffect(() => {
        setOptimisticReactionsCount(prop.data.reactionsNumber);
    }, [prop.data.reactionsNumber, prop.data.postId]);

    useEffect(() => {
        if (!hasNavigationTarget) {
            return;
        }

        setIsCommenting(true);
    }, [hasNavigationTarget, prop.data.postId, resolvedNavigationTarget?.commentId, resolvedNavigationTarget?.replyId]);

    useEffect(() => {
        if (!resolvedNavigationTarget?.shouldAutoScroll) {
            return;
        }

        const targetElementId = resolvedNavigationTarget.replyId
            ? `reply-${resolvedNavigationTarget.replyId}`
            : `comment-${resolvedNavigationTarget.commentId}`;
        const scrollKey = `${prop.data.postId}:${targetElementId}`;
        if (scrolledNavigationKeyRef.current === scrollKey) {
            return;
        }

        let cancelled = false;
        let attempts = 0;

        const scrollToTarget = () => {
            if (cancelled) {
                return;
            }

            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
                scrolledNavigationKeyRef.current = scrollKey;
                return;
            }

            attempts += 1;
            if (attempts < 20) {
                window.setTimeout(scrollToTarget, 120);
            }
        };

        scrollToTarget();

        return () => {
            cancelled = true;
        };
    }, [
        isCommenting,
        prop.data.postId,
        resolvedNavigationTarget?.commentId,
        resolvedNavigationTarget?.replyId,
        resolvedNavigationTarget?.shouldAutoScroll,
    ]);

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
        <div className="relative flex flex-col overflow-hidden shadow-sm bg-white m-2 rounded-md p-2 mb-0">
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
            <div className="flex w-100 text-gray-500">
                <ReactionCount reactionCount={optimisticReactionsCount} />
                <ShareCount {...prop.data.shares} />
            </div>
            <div className="flex w-full text-gray-900 text-sm px-">
                <ReactInput
                    InputTemplateType={{ type: "post" }}
                    ReactionData={optimisticUserPostReaction}
                    targetId={prop.data.postId}
                    onOptimisticReactionChange={handleOptimisticPostReactionChange}
                    text="Mi piace"
                    placeholer="Mi piace"
                    className="cursor-pointer select-none"
                    customSize={16}
                />
                <CommentSpan isCommenting={isCommenting} updateSetIsCommenting={toggleIsCommenting} commentsCount={prop.data.commentNumber} />
                <CondividiSpan />
            </div>
            {isCommenting && <CommentForm postId={prop.data.postId} />}
            {isCommenting && (
                <CommentList
                    postId={prop.data.postId}
                    commentData={prop.data.comments}
                    nowMs={effectiveNowMs}
                    navigationTarget={resolvedNavigationTarget}
                />
            )}
            
        </div>
    )
}
