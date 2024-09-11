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
            <p className="m-0 p-0 text-black">{message.message}</p>
        </div>
    )
}

export default MessageBoxLi