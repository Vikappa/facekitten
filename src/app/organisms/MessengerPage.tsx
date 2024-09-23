'use client'

import { useAppSelector } from "../lib/hooks"
import MessengerLeftBar from "../components/MessengerLeftBar"
import { useEffect, useMemo, useRef, useState } from "react"
import { UserDetails } from "../utils/StorageDataTypes"
import ChatForm from "../components/ChatWindowParts/ChatForm"
import BigChatBoxe from "../components/BigChatBoxe"
import Image from "next/image"

const MessengerPageOrg = ({ remainingHeight }: { remainingHeight: number }) => {
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
    const [staScrivendo, setStaScrivendo] = useState<boolean>(false);
    const allChats = useAppSelector((state) => state.chats.chats);
    const [chatFormHeight, setChatFormHeight] = useState<number>(0);
    const chatFormRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleResize = () => {
            if (chatFormRef.current) {
                const newChatFormHeight = chatFormRef.current.clientHeight;
                setChatFormHeight(newChatFormHeight);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();  

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const chat = useMemo(() => {
        if (!selectedUser) return null;
        return allChats.find(fchat => fchat.chatWith.userName === selectedUser.userName);
    }, [allChats, selectedUser]);


    return (
        <div className="d-flex flex-column" style={{ 
            overflow: 'hidden',
            maxHeight: remainingHeight,
        }}
        >
            <div className="row">
                <MessengerLeftBar remainingHeight={remainingHeight} setSelectedUser={setSelectedUser} />
                {
                    selectedUser && chat && (
                        <div className="col-9 d-flex flex-column p-0 m-0 bg-white">
                            <div className="d-flex p-2 gap-3">
                                <Image src={chat.chatWith.profilepicture} alt={chat.chatWith.userName} height={35} width={35} className="rounded-circle" />
                                <p className="m-0 p-0">{chat.chatWith.userName}</p>
                            </div>
                            <BigChatBoxe chat={chat} staScrivendo={staScrivendo} chatContainerHeight={remainingHeight - chatFormHeight} />
                            <div className="m-0 p-2" ref={chatFormRef}>
                                <ChatForm chat={chat} staScrivendo={staScrivendo} setStaScrivendo={setStaScrivendo} />
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default MessengerPageOrg;
