'use client'

import { Message } from "@/app/utils/StorageDataTypes"

const MessageBoxLi = (
    {message}:
    {message:Message}
) => {


    return(
        <div
        style={{
        }}
        >
            aaaaaaaaaaaaa
            {message.message}
        </div>
    )
}

export default MessageBoxLi