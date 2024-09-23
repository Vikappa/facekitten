'use client'

import { Chat } from "@/app/utils/StorageDataTypes"
import { useEffect, useRef, useState } from "react"
import StaScrivendo from "@/app/atoms/StaScrivendo"
import MessageBoxLi from "./ChatWindowParts/MessageBoxLi"

const BigChatBoxe = (
    { chat, staScrivendo, chatContainerHeight }: 
    { chat: Chat; staScrivendo: boolean, chatContainerHeight: number }
) => {
    const chatContainerRef = useRef<HTMLDivElement | null>(null)
    const headerContainer = useRef<HTMLDivElement | null>(null)
    const [headerHeight, setHeaderHeight] = useState<number>(0)

    useEffect(() => {
        const updateHeaderHeight = () => {
            if (headerContainer.current) {
                setHeaderHeight(headerContainer.current.clientHeight);
            }
        };

        window.addEventListener('resize', updateHeaderHeight);
        updateHeaderHeight();  

        return () => window.removeEventListener('resize', updateHeaderHeight);
    }, []);
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
                flexGrow: 1,
                maxHeight: `${chatContainerHeight-headerHeight-51}px`,  
                minHeight: `${chatContainerHeight-headerHeight-51}px`,
            }}
            className="d-flex flex-column-reverse p-3 py-4 flex-grow-1"
        >
            {staScrivendo && <StaScrivendo staScrivendo={staScrivendo} />}
            {chat.messages.toReversed().map((message, index) => (
                <MessageBoxLi key={index} message={message} />
            ))}
        </div>
    );
}

export default BigChatBoxe;

