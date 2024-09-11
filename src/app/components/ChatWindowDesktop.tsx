'use client'

import { Accordion, Card, Button } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import { Chat, UserDetails } from '../utils/StorageDataTypes';
import ChatForm from './ChatWindowParts/ChatForm';
import { RxCross2 } from "react-icons/rx";
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { closeChatWithUser } from '../lib/slices/userChatsSlice';

const ChatWindowDesktop = (
    {chat, index}: 
    {chat:Chat; index:number}
) => {

    const dispatch = useAppDispatch()
    const [isOpen, setIsOpen] = useState(false)
    const [ hasNewMessage, setHasNewMessage] = useState(false)

    useEffect(() => {
        if(chat){
            if(!(chat.messages.length === 0 ) ){
                setHasNewMessage(true)
            } else {
                if(chat.messages[chat.messages.length - 1]?.seen){
                    setHasNewMessage(true)
                }
            }
        }
    }, [chat])

    if(!isOpen){
        return (
            <div
            style={{
                marginTop:'auto',
                width:'20vw',
                backgroundColor:hasNewMessage?'var(--bs-primary)':'white',
                color:hasNewMessage?'white':'black',
                zIndex:'2000',
                borderTopRightRadius:'5px',
                borderTopLeftRadius:'5px'
            }}
            className='
            d-flex align-items-center justify-content-between
            px-2 py-1
            '
            >
                <p className='m-0 fs-5'>{chat.chatWith.userName}</p>
                <RxCross2 color={hasNewMessage?'white':'black'} style={{cursor:'pointer'}} onClick={() => chat.chatWith !== undefined && dispatch(closeChatWithUser({
                    userName: chat.chatWith.userName,
                    profilepicture: chat.chatWith.profilepicture
                }))} size={25} />
            </div>
            )
    } 
}
export default ChatWindowDesktop
