'use client'

import { useEffect, useMemo } from "react"
import { useAppSelector } from "../lib/hooks"
import ChatWindowDesktop from "./ChatWindowDesktop"
import { Chat } from "../utils/StorageDataTypes"

const ChatsRenderer = () => {

    const openedChats = useAppSelector( state => state.chats.openedChats)

    return(
        <div
        style={{
            position: 'fixed',
            bottom: '0',
            left: '0',
            width: '100%',
            height: '3.9%',
            zIndex:'3000',
        }}
        className="d-flex flex-row-reverse gap-3 px-3 me-5 pe-5"
        >

            {
                openedChats.toReversed().map( (chat, index) => { 
                    return(
                    <ChatWindowDesktop key={index} chat={chat} index={index} />
                        )
                    }
                )
        }
        </div>
    )
}

export default ChatsRenderer