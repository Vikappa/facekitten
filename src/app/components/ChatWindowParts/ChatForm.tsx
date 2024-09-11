'use client'

import { useAppDispatch, useAppSelector } from "@/app/lib/hooks"
import { addMessageToChat } from "@/app/lib/slices/userChatsSlice"
import { fakeChatReplyText } from "@/app/utils/FakeChatReply/FakeChatReply"
import { Chat } from "@/app/utils/StorageDataTypes"
import { stat } from "fs"
import { useState } from "react"
import { Form } from "react-bootstrap"

const ChatForm = (
    {chat, staScrivendo}: 
    {chat:Chat; staScrivendo:boolean}
) => {
    const dispatch = useAppDispatch()
    const [textValue, setTextValue] = useState("")
    const userName = useAppSelector(state => state.userCredentials.userName)
    const profilePic = useAppSelector(state => state.userCredentials.profilepictureUrl)

    const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
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

        setTimeout( async () => {
            const rispostaGatto = await fakeChatReplyText(chat, {
                userName: userName,
                profilepicture: profilePic
            })
        dispatch(addMessageToChat({chat, message: {
            id: 0,
            sender: {
                userName: chat.chatWith.userName,
                profilepicture: chat.chatWith.profilepicture
            },
            receiver: {
                userName: userName,
                profilepicture: profilePic
            },
            message: rispostaGatto,
            timestamp: new Date().toISOString(),
            seen: false
        }}))
        }, Math.floor(Math.random() * 2000) + 1000) 
    }
    return(
        <Form onSubmit={sendMessage}>
        <Form.Control
          type="text"
          id="inputChatText"
          value={textValue}
          onChange={(e) =>  setTextValue(e.target.value)}
          disabled={staScrivendo} 
          autoComplete="off"
        />
        </Form>
       )
}

export default ChatForm