'use client'

interface CommentSpanProps {
    isCommenting: boolean;
    updateSetIsCommenting: () => void;
    commentsCount: number;
}

export default function CommentSpan({ isCommenting, updateSetIsCommenting, commentsCount }: CommentSpanProps) {


    if (!isCommenting) {

        if (commentsCount > 0) {
            return (
                <span onClick={updateSetIsCommenting} className="mx-auto">{commentsCount} commenti</span>
            )
        } else {
            return (
                <span onClick={updateSetIsCommenting} className="mx-auto">Commenta</span>
            )
        }
    }

    if (isCommenting) return (
        <span onClick={updateSetIsCommenting} className="mx-auto text-blue-700">Commenta</span>
    )
}