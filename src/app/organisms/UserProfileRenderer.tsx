'use client'
import Image from "next/image"
import { useAppSelector } from "../lib/hooks"
import ProfileImageResponsiveComponent from "../atoms/ProfileImageResponsiveComponent"
import UserProfilePostRenderer from "../components/UserProfilePostRenderer"

const UserProfileRenderer = () => {
    const coverPhoto = useAppSelector(state => state.userCredentials.coverPhotoUrl)
    const profilePicture = useAppSelector(state => state.userCredentials.profilepictureUrl)
    const userName = useAppSelector(state => state.userCredentials.userName)
    console.log(coverPhoto)

    if(coverPhoto && profilePicture && userName){
        return(
            <>
            <div 
            className="d-flex flex-column align-items-center justify-content-start"
            style={{minHeight: '50vh', background: 'linear-gradient(to top, white 40%, grey 80%)'
            }}
            >
                <div className="col-sm-9">
                <Image src={coverPhoto} alt="Cover Photo" className="w-100 rounded-bottom-3" width={400} height={280}/> 
                <ProfileImageResponsiveComponent/>
                </div>
                
            </div>
                <UserProfilePostRenderer/>
                </>
        )
    } else {
        return null
    }
}

export default UserProfileRenderer