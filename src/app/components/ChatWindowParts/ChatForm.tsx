'use client'

import { useAppDispatch, useAppSelector } from "@/app/lib/hooks"
import { addMessageToChat } from "@/app/lib/slices/userChatsSlice"
import { Chat } from "@/app/utils/StorageDataTypes"
import { stat } from "fs"
import { useState } from "react"
import { Form } from "react-bootstrap"

const ChatForm = (
    {chat}: 
    {chat:Chat}
) => {
    const dispatch = useAppDispatch()
    const [textValue, setTextValue] = useState("")
    const userName = useAppSelector(state => state.userCredentials.userName)
    const profilePic = useAppSelector(state => state.userCredentials.profilepictureUrl)

    const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const message = {
            message: textValue,
            id: chat.messages.length+1,
            sender: {
                userName: userName,
                profilepicture: profilePic
            },
            receiver: chat.chatWith,
            timestamp: new Date().toISOString(),
            seen: false
        }
        dispatch(addMessageToChat({chat, message}))
        setTextValue("")
    }
    return(
        <Form onSubmit={sendMessage}>
        <Form.Control
          type="text"
          id="inputChatText"
          value={textValue}
          onChange={(e) =>  setTextValue(e.target.value)}
        />
        </Form>
       )
}

export default ChatForm