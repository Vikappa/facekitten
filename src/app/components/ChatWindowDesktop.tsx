'use client'

import { Accordion, Card, Button } from 'react-bootstrap';
import { useState } from 'react';
import { Chat } from '../utils/StorageDataTypes';
import ChatForm from './ChatWindowParts/ChatForm';
import { RxCross2 } from "react-icons/rx";

const ChatWindowDesktop = (
    {chat}: 
    {chat:Chat}
) => {

    const setOpen = () =>{
        setIsOpen(true);
    }

    const [isOpen, setIsOpen] = useState(false);

    if(!isOpen){
        return (
            <div
            style={{
                marginTop:'auto',
                width:'20vw',
                backgroundColor:'var(--bs-primary)',
                color:'white',
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
                <RxCross2 color='white' size={25} />
            </div>
            );
    } 
}

export default ChatWindowDesktop;
