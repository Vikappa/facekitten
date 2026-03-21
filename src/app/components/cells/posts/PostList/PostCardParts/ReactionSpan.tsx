'use client'

import { ReactionData } from "@/lib/interfaces/CommonInterfaces";
import { useAppSelector } from "@/lib/redux/hooks";

interface reactionCountProps {
    reactData: ReactionData[];
}

export default function ReactionSpan({ reactData }: reactionCountProps) {

    const userProfileId = useAppSelector((state) => state.profile.currentProfile?.id)
    const userReaction = reactData.filter(r => r.author == userProfileId)


    if(!!userReaction) return (
        <span>Mi piace</span>
    )

}