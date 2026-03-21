'use client'

interface CommentSpanProps {
    isCommenting: boolean
}

export default function CommentSpan({ isCommenting }: CommentSpanProps) {


    if (!isCommenting) return (
        <span className="mx-auto">Commenta</span>
    )

    if (isCommenting) {
        <span className="mx-auto text-blue-700">Commenta</span>
    }
}