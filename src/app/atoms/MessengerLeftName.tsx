'use client'

import Image from "next/image"
import { UserDetails } from "../utils/StorageDataTypes"
import { useAppDispatch } from "../lib/hooks"
import { createChat } from "../lib/slices/userChatsSlice"

const MessengerLeftName = (
    {user, setSelectedUser}:
    {user: UserDetails, setSelectedUser: React.Dispatch<React.SetStateAction<UserDetails
         | null>>}
) => {

    const dispatch = useAppDispatch()
    const handleClick = () => {
        dispatch(createChat({chatWith:user}))
        setSelectedUser(user)
    }

    return(
        <div
        className="d-flex gap-3 align-items-center chatImgPreview p-2"
        onClick={handleClick}
        style={{
            cursor: 'pointer'
        }}
    >
        <Image src={user.profilepicture}
            alt="profile picture"
            width={60}
            height={60}
            className="rounded-circle"
        />
        <p className="d-none d-md-block p-0 m-0">
            {user.userName}
        </p>
    </div>    )
}

export default MessengerLeftName