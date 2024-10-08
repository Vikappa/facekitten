'use client'

import Image from "next/image"
import { useAppSelector } from "../lib/hooks"
import MessengerSearchBar from "../atoms/MessengerSearchBar"
import { UserDetails } from "../utils/StorageDataTypes"
import MessengerLeftName from "../atoms/MessengerLeftName"
import { SetStateAction, useRef } from "react"

const MessengerLeftBar = (
    {setSelectedUser,remainingHeight}:
    {setSelectedUser: React.Dispatch<React.SetStateAction<UserDetails | null>>;remainingHeight:number}
) => {

    const allUsers = useAppSelector(state => state.sessionGeneratedAccounts.acc);

    return (
        <div className="col-3 d-flex flex-column bg-white shadow"
             style={{
                 overflowY: 'auto',
                 zIndex: 2,
                 maxHeight:`${remainingHeight}px`
             }}
        >
            <h3 className="">Chats:</h3>
            <MessengerSearchBar/>
            <div className="d-flex flex-column justify-content-start" >
                {
                    allUsers.map((user, index) => (
                        <MessengerLeftName key={index} user={{
                            userName: user.name,
                            profilepicture: user.profilePic,
                            ...user
                        }} setSelectedUser={setSelectedUser}/>
                    ))
                }
            </div>
        </div>
    )
}

export default MessengerLeftBar;


