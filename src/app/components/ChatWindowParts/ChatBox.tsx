'use client'

import { Chat } from "@/app/utils/StorageDataTypes"
import MessageBoxLi from "./MessageBoxLi"
import { useEffect } from "react"

const ChatBox = (
    {chat}: 
    {chat:Chat}
) => {

    useEffect(() => {
      console.log(chat.messages)
    }, [chat.messages])
    

    return(
        <div
        style={{
            minHeight:'25vh'
        }}
        className="d-flex flex-column justify-content-end gap-2"
        >
            {chat.messages.map((message, index) => (
                <p key={index}>{message.message}</p>
            ))}
        </div>
    )
}

export default ChatBox