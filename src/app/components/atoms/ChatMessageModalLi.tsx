'use client'

import type { ChatThreadData } from "@/lib/interfaces/CommonInterfaces";
import Link from "next/link";

interface ChatMessageModalLiProps {
    chatThread: ChatThreadData;
}

export default function ChatMessageModalLi({ chatThread }: ChatMessageModalLiProps) {
    const latestMessage = chatThread.chats[chatThread.chats.length - 1];
    const displayName = chatThread.withProfile.username || "Chat";

    return (
        <Link
            href={chatThread.withProfile.profileUrl}
            className="flex flex-col gap-0.5 rounded-md p-2 hover:bg-slate-100"
        >
            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="truncate text-xs text-slate-600">{latestMessage?.text || "Apri la chat"}</p>
            <span className="text-[10px] text-slate-500">{chatThread.lastMessageAt}</span>
        </Link>
    );
}
