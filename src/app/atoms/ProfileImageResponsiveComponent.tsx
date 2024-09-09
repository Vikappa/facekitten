'use client'
import Image from "next/image"
import { useAppSelector } from "../lib/hooks"

const ProfileImageResponsiveComponent = () => {
    const profilePicture = useAppSelector(state => state.userCredentials.profilepictureUrl)

    return(
            <>
                <Image 
                src={profilePicture}
                alt="Profile Picture" 
                className="rounded-circle d-none d-sm-block" 
                width={150} height={150}
                style={{position:'absolute',
                    border:'5px solid white'
                    }}
                />
                <Image 
                src={profilePicture}
                alt="Profile Picture" 
                className="rounded-circle d-sm-none" 
                width={200} height={200}
                style={{position:'relative',
                    top: '-5rem',
                    border:'5px solid white'
                }}
                />
            </>
            )
}

export default ProfileImageResponsiveComponent