'use client'
import Image from "next/image"
import { useAppSelector } from "../lib/hooks"

const UserProfileRenderer = () => {
    const coverPhoto = useAppSelector(state => state.userCredentials.coverPhotoUrl)
    const profilePicture = useAppSelector(state => state.userCredentials.profilepictureUrl)
    const userName = useAppSelector(state => state.userCredentials.userName)
    console.log(coverPhoto)

    if(coverPhoto && profilePicture && userName){
        return(
            <div 
            className="d-flex flex-column align-items-center justify-content-center bg-white"
            style={{minHeight: '20vh', background: 'linear-gradient(to top, var(--bs-grayBg), grey)' // dal bianco (#ffffff) al blu (#0000ff)e0e0e0
            }}
            >
                <div className="col-sm-8">
                <Image src={coverPhoto} alt="Cover Photo" className="w-100 rounded-bottom-3" width={400} height={180}/> 
                </div>
                
            </div>
        )
    } else {
        return null
    }
}

export default UserProfileRenderer