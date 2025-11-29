// ReactionMart.tsx
'use client';

import { ReactionAtom } from "./ReactionAtom";

interface ReactionMartProps {
  onHandleReaction: (reactionId: number) => void;
}

export function ReactionMart({ onHandleReaction }: ReactionMartProps) {
  return (
    <div className="flex flex-col bg-white shadow-lg rounded-xl border border-gray-200 p-2">
      <div className="flex gap-2 mb-1">
        <button onClick={() => onHandleReaction(0)}><ReactionAtom size={32} type={0}/></button>
        <button onClick={() => onHandleReaction(1)}><ReactionAtom size={32} type={1}/></button>
        <button onClick={() => onHandleReaction(2)}><ReactionAtom size={32} type={2}/></button>
        <button onClick={() => onHandleReaction(3)}><ReactionAtom size={32} type={3}/></button>
        <button onClick={() => onHandleReaction(4)}><ReactionAtom size={32} type={4}/></button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onHandleReaction(5)}><ReactionAtom size={32} type={5}/></button>
        <button onClick={() => onHandleReaction(6)}><ReactionAtom size={32} type={6}/></button>
        <button onClick={() => onHandleReaction(7)}><ReactionAtom size={32} type={7}/></button>
        <button onClick={() => onHandleReaction(8)}><ReactionAtom size={32} type={8}/></button>
        <button onClick={() => onHandleReaction(9)}><ReactionAtom size={32} type={9}/></button>
      </div>
    </div>
  );
}
