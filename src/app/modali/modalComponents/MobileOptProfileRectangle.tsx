'use client'
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { setNavbarPage, updateShowOptionsModal } from "@/app/lib/slices/appStateSlice";
import Image from "next/image";
import { useRouter } from "next/navigation";

const MobileOptProfileRectangle = () => {

    const router = useRouter()
    const dispatch = useAppDispatch()
    const userName = useAppSelector(state => state.userCredentials.userName)
    const profilepictureUrl = useAppSelector(state => state.userCredentials.profilepictureUrl)

    const handleClick = () => {
        dispatch(setNavbarPage(11))
        dispatch(updateShowOptionsModal())
        router.push('/userprofile')
    }

    return(
    <div 
    onClick={handleClick}
    className="
    bg-white w-100 p-2 mt-3 px-3 d-flex align-items-center gap-3
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