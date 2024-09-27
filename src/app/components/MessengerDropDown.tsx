'use client'
import { CiSearch } from "react-icons/ci";
import { useAppSelector } from "../lib/hooks";
import Image from "next/image";
import { useMemo } from "react";

const MessengerDropDown = () => {

    const chats = useAppSelector(state => state.chats.chats)
    const show = useAppSelector(state => state.status.showMessengerDropDown)
    const shownChat = useMemo(() => 
        {
            let returnChats = chats.filter(chat => chat.messages.length > 0)
            returnChats.sort((a,b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
            returnChats.slice(0, 5)
            return returnChats
        },
     [chats])

    if(!show) {
        return null
    } else {

    return(
        <div className="
        bg-white text-black
        d-flex flex-column p-3 
        position-absolute shadow rounded-3
        " style={{
            top:'50%',
            right:'50%',
            width:'350px',
        }}>
            <h3 className="fw-semibold m-0 p-0 text-start">
                Chats
            </h3>

            <form className="d-flex align-items-center m-2">
                <CiSearch style={{
                    position:'absolute',
                    left:'8%',
                }}
                size={30} />
                <input type="text" 
                className="w-100 p-1 px-2 fs-5 border-0 rounded-pill bg-grayBg" 
                placeholder="     Search Messenger"/>
            </form>

        {
            shownChat.map( chat => {
                return(
                    <div key={chat.id} className="d-flex align-items-center gap-2 justify-content-start my-2">
                        <Image src={chat.chatWith.profilepicture} 
                        alt={chat.chatWith.userName} 
                        height={50} width={50} className="rounded-circle" />
                        <div className={`d-flex flex-column text-start`}>
                            <h5 style={{
                                fontSize:'1.2rem',
                                whiteSpace:'nowrap',
                                overflow:'hidden',
                                textOverflow:'ellipsis',
                                maxWidth:'100%',
                                margin:'0'
                            }}>{chat.chatWith.userName}</h5>
                            <p style={{
                                fontSize:'1rem',
                                color:'gray',
                                whiteSpace:'nowrap',
                                overflow:'hidden',
                                textOverflow:'ellipsis',
                                maxWidth:'100%',
                                margin:'0'
                            }}>{chat.messages[chat.messages.length-1].message}</p>
                        </div>
                    </div>
                )
            })
        }


        </div>
    )
}
}

export default MessengerDropDown