'use client'

import { Accordion, Card, Button } from 'react-bootstrap';
import { useState } from 'react';
import { Chat } from '../utils/StorageDataTypes';
import ChatForm from './ChatWindowParts/ChatForm';

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
            <button
            style={{
                marginTop:'auto',
                width:'20vw',
                backgroundColor:'var(--bs-primary)',
                color:'white',
                border:'1px solid black',
                zIndex:'2000'
            }}
            onClick={setOpen}
            >
                {chat.chatWith.userName}
            </button>
            );
    } else {
        <button
        style={{
            marginTop:'auto',
            width:'20vw',
            backgroundColor:'var(--bs-primary)',
            color:'white',
            border:'1px solid black',
            zIndex:'2000'
        }}
        onClick={setOpen}
        >
            {chat.chatWith.userName}
        </button>
        }
}

export default ChatWindowDesktop;
