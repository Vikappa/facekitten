'use client'

import { useAppSelector } from "../lib/hooks"
import MessengerLeftBar from "../components/MessengerLeftBar"
import { useEffect, useMemo, useState } from "react"
import { UserDetails } from "../utils/StorageDataTypes"
import ChatForm from "../components/ChatWindowParts/ChatForm"
import BigChatBoxe from "../components/BigChatBoxe"

const MessengerPageOrg = () => {

    const [selectedUser, setSelectedUser] = useState<UserDetails|null>(null)
    const [staScrivendo, setStaScrivendo] = useState<boolean>(false)
    const allChats = useAppSelector((state) => state.chats.chats)

    const chat = useMemo(() => {
        if(!selectedUser) return null
        const chat = allChats.find(fchat => fchat.chatWith.userName === selectedUser.userName)
        return chat
    }, [allChats, selectedUser])

        return(
            <div className="container-fluid">
                <div className="row">
                    <MessengerLeftBar setSelectedUser={setSelectedUser}/>
                    {
                        selectedUser && chat &&
                        <div className="col-9">
                            <BigChatBoxe chat={chat} staScrivendo={false}/>
                            <ChatForm chat={chat} staScrivendo={staScrivendo} setStaScrivendo={setStaScrivendo}/>
                        </div>
                    }
    
                    <div className="col-0 col-lg-3">
    
                    </div>
    
                </div>
            </div>
        )
    
}

export default MessengerPageOrg