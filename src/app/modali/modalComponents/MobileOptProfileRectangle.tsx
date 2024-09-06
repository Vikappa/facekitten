'use client'
import { useAppSelector } from "@/app/lib/hooks";
import Image from "next/image";

const MobileOptProfileRectangle = () => {
    const userName = useAppSelector(state => state.userCredentials.userName)
    const profilepictureUrl = useAppSelector(state => state.userCredentials.profilepictureUrl

    )
    return(
    <div 
    className="
    bg-white w-100 p-2 px-3 d-flex align-items-center gap-3
    rounded-3 
    "
    style={{
        border:'1px solid var(--bs-quinary)'
    }}
    >
        <Image src={profilepictureUrl} alt={userName} width={34} height={34} className="rounded-circle" />
        <div className="d-flex flex-column justify-content-start">
            <p className="p-0 m-0">{userName}</p>
            <p className="p-0 m-0 text-secondary" style={{fontSize:'0.9rem'}}>Vai al tuo profilo</p>
        </div>
    </div>
    )
}

export default MobileOptProfileRectangle;