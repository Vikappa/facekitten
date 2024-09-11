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
        className="d-flex flex-column justify-content-end py-2 bg-white"
        >
            {chat.messages.map((message, index) => (
                <MessageBoxLi key={index} message={message} />
            ))}
        </div>
    )
}

export default ChatBox