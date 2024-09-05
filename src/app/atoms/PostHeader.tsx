'use client'
import Image from "next/image"
import { UserDetails } from "../utils/StorageDataTypes"
import { FaUserFriends } from "react-icons/fa";
import { HiDotsHorizontal } from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";

const PostHeader = ({user, time}: {user:UserDetails|undefined; time:Date|undefined}) => {

    const timeDifference = ():string => {
        const timeDifference = new Date().getTime() - time!.getTime();
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if(seconds < 60){
            return "Adesso";
        }
        else
        if(minutes < 60){
            return `${minutes}m`;
        }
        else
        if(hours < 24){
            return `${hours}o`;
        }
        else
        if(days < 30){
            return `${days}g`;
        }
        else
        if(months < 12){
            return `${months}m`;
        }
        else{
            return `${years}a`;
        }
    }

    if(user){
        return(
            <div className="d-flex align-items-center gap-3">
                <Image src={user.profilepicture} alt={'Profile picture of ' + user.userName} width={40} height={40} 
                className="rounded-circle"
                />
                <div>
                <p className="fw-bold m-0 p-0">{user.userName}</p>
                <p className="m-0 p-0 d-flex align-items-center gap-2 text-secondary" style={{fontSize:'0.85rem'}}>{time ? timeDifference() : ''} · <FaUserFriends /></p>
                </div>

                <div className="ms-auto d-flex align-items-center gap-2" style={{transform:'translateY(-10px)'}}>

                <HiDotsHorizontal size={25}/>
                <IoCloseOutline size={33}/>

                </div>
            </div>
        )
    }
    return null;
}
export default PostHeader