'use client'
import Image from "next/image"
import { UserDetails } from "../utils/StorageDataTypes"
import { FaUserFriends } from "react-icons/fa";
import { HiDotsHorizontal } from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";
import Link from "next/link";

const PostHeader = ({user, time}: {user:UserDetails|undefined; time:string|undefined}) => {
    const timeDifference = ():string => {
        if (!time) return "Adesso";
        const timeDifference = new Date().getTime() - new Date(time).getTime();
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if(seconds < 60){
            return "Adesso";
        }
        else if(minutes < 60){
            return `${minutes}minuti fa`;
        }
        else if(hours < 24){
            return `${hours}ore fa`;
        }
        else if(days < 30){
            return `${days}giorni fa`;
        }
        else if(months < 12){
            return `${months}mesi fa`;
        }
        else{
            return `${years}anni fa`;
        }
    }

    if(user){
        return(
            <div className="d-flex align-items-center gap-3 underline-none">
                <Image src={user.profilepicture} alt={'Profile picture of ' + user.userName} width={40} height={40} 
                className="rounded-circle"
                />
                <div>
                <Link href={"/userprofile/" + encodeURIComponent(user.userName)}
                style={{
                        textDecoration:'none',
                        color:'#000',
                        fontWeight:'bold',
                        fontSize:'1.2rem',
                    }}>
                        <p className="m-0 p-0" style={{
                            }}>{user.userName}</p>
                    </Link>
                    <p className="m-0 p-0 d-flex align-items-center gap-2 text-secondary" 
                    style={{
                        fontSize:'0.85rem',
                        textDecoration:'none',
                        }}>{time ? timeDifference() : ''} · <FaUserFriends /></p>
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