'use client'
import { IoSend } from "react-icons/io5";
import RoundGreyBorderLess from "@/app/atoms/RoundActivableButton"
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks"
import { addMessageToChat } from "@/app/lib/slices/userChatsSlice"
import { fakeChatReplyText } from "@/app/utils/FakeChatReply/FakeChatReply"
import { Chat } from "@/app/utils/StorageDataTypes"
import { stat } from "fs"
import { useState } from "react"
import { Form } from "react-bootstrap"

const ChatForm = (
    {chat, staScrivendo,setStaScrivendo}: 
    {chat:Chat; staScrivendo:boolean, setStaScrivendo:(staScrivendo:boolean)=>void}
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
            const rispostaGatto = await fakeChatReplyText(chat, setStaScrivendo, {
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
        <Form 
        onSubmit={sendMessage}
        className="d-flex p-1 px-2 bg-white"
        >
        <Form.Control
          type="text"
          id="inputChatText"
          value={textValue}
          onChange={(e) =>  setTextValue(e.target.value)}
          disabled={staScrivendo} 
          autoComplete="off"
        />
        <RoundGreyBorderLess bgSelected={"bg-grayBg"} bgNotSelected={"bg-grayBg"} iconSelected={<IoSend />} iconUnselected={<IoSend />} selected={false} onClick={()=>sendMessage} size={0}/>
        </Form>
       )
}

export default ChatForm