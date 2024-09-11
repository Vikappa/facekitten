'use client'

import { useAppSelector } from "../lib/hooks"
import MessengerLeftBar from "../components/MessengerLeftBar"
import { useEffect, useMemo, useState } from "react"
import { UserDetails } from "../utils/StorageDataTypes"
import ChatForm from "../components/ChatWindowParts/ChatForm"
import BigChatBoxe from "../components/BigChatBoxe"

const MessengerPageOrg = ({ navbarHeight }: { navbarHeight: number }) => {
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
    const [staScrivendo, setStaScrivendo] = useState<boolean>(false);
    const allChats = useAppSelector((state) => state.chats.chats);

    const chat = useMemo(() => {
        if (!selectedUser) return null;
        const chat = allChats.find(fchat => fchat.chatWith.userName === selectedUser.userName);
        return chat;
    }, [allChats, selectedUser]);

    return (
        <div className="d-flex flex-column" style={{ height: `calc(100vh - ${navbarHeight}px)`, overflow: 'hidden' }}>
            <div className="row flex-grow-1 d-flex" style={{ height: '100%' }}>
                <MessengerLeftBar setSelectedUser={setSelectedUser} navbarHeight={navbarHeight} />
                {
                    selectedUser && chat && (
                        <div className="col-9 d-flex flex-column" style={{ height: '100%' }}>
                            <BigChatBoxe chat={chat} staScrivendo={staScrivendo} />
                            <ChatForm chat={chat} staScrivendo={staScrivendo} setStaScrivendo={setStaScrivendo} />
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default MessengerPageOrg;


