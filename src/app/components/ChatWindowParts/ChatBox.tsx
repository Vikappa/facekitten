'use client'

import { Chat } from "@/app/utils/StorageDataTypes"
import MessageBoxLi from "./MessageBoxLi"
import { useEffect, useRef } from "react"
import StaScrivendo from "@/app/atoms/StaScrivendo"

const ChatBox = (
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
                minHeight: '25vh',
                maxHeight: '25vh',
                backgroundColor: 'white',
                overflowY: 'auto',
                paddingBottom:'6px' 
            }}
        >
            {chat.messages.map((message, index) => (
                <MessageBoxLi key={index} message={message} />
            ))}

            {staScrivendo && <StaScrivendo staScrivendo={staScrivendo} />}
        </div>
    );
}

export default ChatBox;
