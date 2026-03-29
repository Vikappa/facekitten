'use client'

interface reactionCountProps {
    reactionCount: number
}

export default function ReactionCount({ reactionCount }: reactionCountProps){
    if (reactionCount <= 0) {
        return <span className="text-xs text-gray-500 px-2">0 reazioni</span>;
    }

    const label = reactionCount === 1 ? "reazione" : "reazioni";

    return (
        <span className="text-xs text-gray-500 px-2">{reactionCount} {label}</span>
    )
}
