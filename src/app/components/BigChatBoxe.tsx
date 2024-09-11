'use client'

import { Chat } from "@/app/utils/StorageDataTypes"
import { useEffect, useRef } from "react"
import StaScrivendo from "@/app/atoms/StaScrivendo"
import MessageBoxLi from "./ChatWindowParts/MessageBoxLi"

const BigChatBoxe = (
    {chat, staScrivendo}: 
    {chat: Chat; staScrivendo: boolean}
) => {
    const chatContainerRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat.messages]);

    return (
        <div
            ref={chatContainerRef} 
            style={{
                backgroundColor: 'white',
                overflowY: 'auto',
                paddingBottom: '6px',
                flexGrow: 1, // Riempie tutto lo spazio disponibile
            }}
        >
            {chat.messages.map((message, index) => (
                <MessageBoxLi key={index} message={message} />
            ))}

            {staScrivendo && <StaScrivendo staScrivendo={staScrivendo} />}
        </div>
    );
}

export default BigChatBoxe;

