'use client'
import Image from "next/image"
import { useAppSelector } from "../lib/hooks"
import FriendsImagesRow from "../components/FriendsImagesRow"

const ProfileImageResponsiveComponent = () => {
    const profilePicture = useAppSelector(state => state.userCredentials.profilepictureUrl)
    const userName = useAppSelector(state => state.userCredentials.userName)
    const friendsNum = useAppSelector(state => state.friendList.friends.length)
    return(
            <>
            {/* desktop */}
            <div className="d-flex position-relative flex-column d-none d-sm-block">
                <div className="d-flex position-relative align-items-center justify-content-start d-100 px-3">
                    <Image 
                    src={profilePicture}
                    alt="Profile Picture" 
                    className="rounded-circle" 
                    width={150} height={150}
                    style={{position:'relative',
                    top: '-2rem',
                        border:'5px solid white'
                        }}
                    />
                    <div className="d-flex px-2 flex-column align-items-start justify-content-center text-start fw-bold">
                        <h3 className="m-0 fw-bold">{userName}</h3>
                        <p className="" style={{color:'gray', fontSize:'0.9rem'}}>{friendsNum} a-mici</p>
                        <FriendsImagesRow/>
                    </div>

                    <div className="ms-auto">
                        add story edit profile
                    </div>
                </div>
                <div>
                    <hr/>
                    posts about friends photos videos checkins more
                </div>
            </div>


            {/* mobile */}

            <div className="d-sm-none d-flex flex-column align-items-center justify-content-center">
                    <Image 
                    src={profilePicture}
                    alt="Profile Picture" 
                    className="rounded-circle" 
                    width={200} height={200}
                    style={{position:'relative',
                        top: '-5rem',
                        border:'5px solid white'
                    }}
                    />
                    <div className="d-flex px-2 flex-column align-items-start justify-content-center text-start fw-bold"
                        style={{position:'relative',
                            top: '-5rem',
                            border:'5px solid white',
                            marginBottom:'-6rem'
                            }}
                    >
                        <h3 className="m-0 fw-bold">{userName}</h3>
                        <p className="" style={{color:'gray', fontSize:'0.9rem'}}>{friendsNum} a-mici</p>
                        <FriendsImagesRow/>
                    </div>
                    <div>
                    <hr/>
                    posts about  more
                </div>
            </div>

            </>
            )
}

export default ProfileImageResponsiveComponent