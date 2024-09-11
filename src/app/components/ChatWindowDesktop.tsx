'use client'

import { Accordion, Card, Button } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import { Chat, UserDetails } from '../utils/StorageDataTypes';
import ChatForm from './ChatWindowParts/ChatForm';
import { RxCross2 } from "react-icons/rx";
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { closeChatWithUser } from '../lib/slices/userChatsSlice';
import ChatBox from './ChatWindowParts/ChatBox';
import Image from 'next/image';

const ChatWindowDesktop = (
    {chat, index}: 
    {chat:Chat; index:number}
) => {

    const dispatch = useAppDispatch()
    const [isOpen, setIsOpen] = useState(true)
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

    if (isOpen) {
        return (
            <div
                style={{
                    width: '20vw',
                    backgroundColor: hasNewMessage ? 'var(--bs-primary)' : 'white',
                    color: hasNewMessage ? 'white' : 'black',
                    zIndex: '2000',
                    borderTopRightRadius: '5px',
                    borderTopLeftRadius: '5px',
                    position: 'fixed',  
                    bottom: '0',        
                    right: `${index * 23+5}vw`, 
                    height: 'auto',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    border: '1px solid var(--bs-quaternary)',
                }}
                className="d-flex flex-column px-2 py-1 shadow"
            >
                <div className="d-flex justify-content-between"
                style={{
                    cursor: 'pointer'
                }}
                onClick={() => setIsOpen(!isOpen)}
                >
                <div className='d-flex align-items-center gap-2'>
                <Image src={chat.chatWith.profilepicture} alt="profile picture" width={25} height={25} className="rounded-circle" />
                <p className="m-0 fs-5">{chat.chatWith.userName}</p>
                </div>                    <RxCross2
                        color={hasNewMessage ? 'white' : 'black'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => chat.chatWith !== undefined && dispatch(closeChatWithUser({
                            userName: chat.chatWith.userName,
                            profilepicture: chat.chatWith.profilepicture
                        }))}
                        size={25}
                    />
                </div>
    
                <ChatBox chat={chat} />
                <ChatForm chat={chat} />
            </div>
        );
    } else {
        return (
            <div
                style={{
                    width: '20vw', 
                    backgroundColor: hasNewMessage ? 'var(--bs-primary)' : 'white',
                    color: hasNewMessage ? 'white' : 'black',
                    zIndex: '2000',
                    borderTopRightRadius: '5px',
                    borderTopLeftRadius: '5px',
                    position: 'fixed', 
                    bottom: '0',    
                    right: `${index * 23+5}vw`,  
                    height: 'auto',
                    maxHeight: '80vh',
                    border: '1px solid var(--bs-quaternary)',
                    cursor: 'pointer'
                }}
                className="d-flex align-items-center justify-content-between px-2 py-1"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className='d-flex align-items-center gap-2'>
                <Image src={chat.chatWith.profilepicture} alt="profile picture" width={25} height={25} className="rounded-circle" />
                <p className="m-0 fs-5">{chat.chatWith.userName}</p>
                </div>
                <RxCross2
                    color={hasNewMessage ? 'white' : 'black'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => chat.chatWith !== undefined && dispatch(closeChatWithUser({
                        userName: chat.chatWith.userName,
                        profilepicture: chat.chatWith.profilepicture
                    }))}
                    size={25}
                />
            </div>
        );
    }
    
    
}
export default ChatWindowDesktop
