'use client'

import { CommentData } from "@/lib/interfaces/CommonInterfaces"
import CommentLi from "./CommentLi"

interface CommentListProps{
    postId: string;
    commentData:CommentData[]
    nowMs:number
    navigationTarget?: {
        commentId: string | null;
        replyId: string | null;
        shouldAutoScroll?: boolean;
    }
}

export default function CommentList({postId, commentData, nowMs, navigationTarget}:CommentListProps){
    const navigationCommentId = navigationTarget?.commentId ?? null;
    const navigationReplyId = navigationTarget?.replyId ?? null;
    const shouldAutoScroll = navigationTarget?.shouldAutoScroll === true;


    return (
        <div className="flex w-full flex-col mt-2">
            {
                commentData.map((c) => {
                    const hasTargetReply =
                        navigationReplyId !== null &&
                        c.commentReplies.some((reply) => reply.commentReplyId === navigationReplyId);
                    const isTargetComment = navigationCommentId === c.commentId || hasTargetReply;

                    return (
                        <CommentLi
                            comment={c}
                            postId={postId}
                            key={c.commentId}
                            nowMs={nowMs}
                            navigationTarget={
                                isTargetComment
                                    ? {
                                        commentId: c.commentId,
                                        replyId: hasTargetReply ? navigationReplyId : null,
                                        shouldAutoScroll,
                                    }
                                    : undefined
                            }
                        />
                    );
                })
            }
        </div>
    )
}
