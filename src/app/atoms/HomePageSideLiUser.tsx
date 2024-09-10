'use client'

import Image from "next/image"
import { UserDetails } from "../utils/StorageDataTypes"

const HomePageSideLiUser = (
    {user}:
    {user:UserDetails}
) => {
    if(user){
        return(
            <li className="d-flex gap-2 py-1">
                <Image src={user.profilepicture} alt={user.userName} width={20} height={20} className="rounded-circle" />{user.userName}
            </li>
        )
    }
    else return null
}

export default HomePageSideLiUser