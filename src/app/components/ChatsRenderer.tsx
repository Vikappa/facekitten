'use client'

import { useAppSelector } from "../lib/hooks"
import ChatWindowDesktop from "./ChatWindowDesktop"

const ChatsRenderer = () => {

    const chatsArray = useAppSelector( state => state.chats.chats)

    return(
        <div
        style={{
            position: 'fixed',
            bottom: '0',
            left: '0',
            width: '100%',
            height: '3.9%',
            zIndex:'3000'
        }}
        className="d-flex flex-row-reverse gap-3 px-3 me-5"
        >

            {
                chatsArray.toReversed().map( (chat, index) => { return(
                    <ChatWindowDesktop key={index} chat={chat} />
                )
            })
        }
        </div>
    )
}

export default ChatsRenderer