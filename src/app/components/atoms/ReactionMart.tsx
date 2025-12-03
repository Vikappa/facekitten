'use client';

import { ReactionAtom } from "./ReactionAtom";
import { ReactionType } from "@/lib/Classes/Reaction/Reaction";

interface ReactionMartProps {
  onHandleReaction: (reactionType: ReactionType) => Promise<void>;
  currentReactionStatus: ReactionType | undefined;
}

export function ReactionMart({ onHandleReaction, currentReactionStatus }: ReactionMartProps) {

  const buttons: ReactionType[] = [
    ReactionType.like,
    ReactionType.love,
    ReactionType.care,
    ReactionType.laugh,
    ReactionType.wow,
    ReactionType.sad,
    ReactionType.angry,
    ReactionType.gay,
    ReactionType.flower,
    ReactionType.boom,
  ];

  return (
    <div className="flex flex-col bg-white shadow-lg rounded-xl border border-gray-200 p-2">
      <div className="grid grid-cols-5 gap-2">
        {buttons.map((type) => (
          <button
            key={type}
            onClick={() => onHandleReaction(type)}
            className={type === currentReactionStatus ? "scale-110" : ""}
          >
            <ReactionAtom size={32} type={type} />
          </button>
        ))}
      </div>
    </div>
  );
}
