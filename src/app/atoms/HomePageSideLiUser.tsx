'use client'

import Image from "next/image"
import { UserDetails } from "../utils/StorageDataTypes"
import { useAppDispatch, useAppSelector } from "../lib/hooks"
import { createChat, openChatWithUser } from "../lib/slices/userChatsSlice"

const HomePageSideLiUser = (
    {user}:
    {user:UserDetails}
) => {

    const dispatch = useAppDispatch()

    const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
        dispatch(createChat({chatWith:user}))
    }


    if(user){
        return(
            <li 
            className="d-flex gap-2 py-1 sideLiUser"
            onClick={handleClick}
            >
                <Image src={user.profilepicture} alt={user.userName} width={20} height={20} className="rounded-circle" />{user.userName}
            </li>
        )
    }
    else return null
}

export default HomePageSideLiUser