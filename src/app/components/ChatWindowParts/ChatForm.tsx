'use client'
import { IoSend } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks"
import { addMessageToChat } from "@/app/lib/slices/userChatsSlice"
import { fakeChatReplyText } from "@/app/utils/FakeChatReply/FakeChatReply"
import { Chat, Message } from "@/app/utils/StorageDataTypes"
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
    const coverPhotoUrl = useAppSelector(state => state.userCredentials.coverPhotoUrl)

    const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const message = {
            message: textValue,
            id: chat.messages.length+1,
            sender: {
                userName: userName,
                profilepicture: profilePic,
                coverPhotoUrl: coverPhotoUrl,
            },
            receiver: chat.chatWith,
            timestamp: new Date().toISOString(),
            seen: false
        }
        
        dispatch(addMessageToChat({chat, message}))
        setTextValue("")

        setTimeout( async () => {

            const targetChat:Chat = {
                id: chat.id,
                chatWith: {
                    userName: chat.chatWith.userName,
                    profilepicture: chat.chatWith.profilepicture,
                    coverPhotoUrl: chat.chatWith.coverPhotoUrl
                },
                lastMessage: chat.lastMessage,
                lastMessageTime: chat.lastMessageTime,
                lastMessageStatus: chat.lastMessageStatus,
                messages: [...chat.messages, message]
            }

                const rispostaGatto = await fakeChatReplyText(targetChat, setStaScrivendo, {
                userName: userName,
                profilepicture: profilePic,
                coverPhotoUrl: coverPhotoUrl,
                })
                dispatch(addMessageToChat({chat, message: {
                    id: 0,
                    sender: {
                        userName: chat.chatWith.userName,
                        profilepicture: chat.chatWith.profilepicture,
                        coverPhotoUrl: chat.chatWith.coverPhotoUrl,
                    },
                    receiver: {
                        userName: userName,
                        profilepicture: profilePic,
                        coverPhotoUrl: coverPhotoUrl,
                    },
                    message: rispostaGatto,
                    timestamp: new Date().toISOString(),
                    seen: false
                }}))
            
        }, Math.floor(Math.random() * 2000) + 1000) 
    }

    const handleSendClick = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
        e.preventDefault()
        sendMessage(e as unknown as React.FormEvent<HTMLFormElement>)
    }

    return(
        <Form 
        onSubmit={sendMessage}
        className="d-flex align-items-center p-1 gap-2 px-2 bg-white"
        >
        <Form.Control
          type="text"
          id="inputChatText"
          value={textValue}
          onChange={(e) =>  setTextValue(e.target.value)}
          disabled={staScrivendo} 
          autoComplete="off"
        />
        <IoSend size={30} color="black" onClick={handleSendClick}/>
        </Form>
       )
}
export default ChatForm