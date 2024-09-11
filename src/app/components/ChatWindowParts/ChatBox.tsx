'use client'

import { Chat } from "@/app/utils/StorageDataTypes"
import MessageBoxLi from "./MessageBoxLi"
import { useEffect, useState } from "react"
import StaScrivendo from "@/app/atoms/StaScrivendo"

const ChatBox = (
    {chat, staScrivendo}: 
    {chat:Chat; staScrivendo:boolean}
) => {

    

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
            
            {staScrivendo && <StaScrivendo staScrivendo={staScrivendo} />}
        </div>
    )
}

export default ChatBox