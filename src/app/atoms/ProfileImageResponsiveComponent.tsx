'use client'
import Image from "next/image"
import { useAppSelector } from "../lib/hooks"
import FriendsImagesRow from "../components/FriendsImagesRow"
import ProfilePageBar from "../components/ProfilePageBar"
import { useState } from "react"
import { Button } from "react-bootstrap"
import { FaPencilAlt } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa";
import { BiSolidAddToQueue } from "react-icons/bi";
import { RiUserAddFill } from "react-icons/ri";
import ProfilePageBarButton from "./ProfilePageBarButton"

const ProfileImageResponsiveComponent = (
    {profilePicture, userName}:
    {profilePicture: string, userName: string}
) => {
    const humanUserCredentials = useAppSelector(state => state.userCredentials)
    const friendsNum = useAppSelector(state => state.friendList.friends.length)
    const [profileBarState, setProfileBarState] = useState(1)
    const [profileBarNum, setProfileBarNum] = useState(1)
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

                    <div className="ms-auto d-flex align-items-center gap-2">
                    {                        
                        (humanUserCredentials.userName === userName && humanUserCredentials.profilepictureUrl === profilePicture) ?
                        <>
                            <Button variant="primary" className="fw-semibold fs-5 ">
                                    + Add a story
                            </Button>
                            <Button variant="quinary" className="fw-semibold fs-5" style={{ color: '#1D1F23' }}>
                                <FaPencilAlt /> Edit profile
                            </Button>
                            <Button variant="quinary" className="fw-semibold fs-5" style={{ color: '#1D1F23' }}>
                                <FaAngleDown />
                            </Button>
                        </>
                        :
                        <>
                            <Button variant="quinary" className="fw-semibold fs-5" style={{ color: '#1D1F23' }}>
                                <FaFacebookMessenger /> Message
                            </Button>
                            <Button variant="primary" className="fw-semibold fs-5 ">
                                <BiSolidAddToQueue />    + Follow 
                            </Button>
                            <Button variant="quinary" className="fw-semibold fs-5" style={{ color: '#1D1F23' }}>
                                <RiUserAddFill /> Add Friend
                            </Button>
                            <Button variant="quinary" className="fw-semibold fs-5" style={{ color: '#1D1F23' }}>
                                <FaAngleDown />
                            </Button>
                        </>                        
                    }
                    </div>
                </div>
                <div>
                    <hr/>
                    <ProfilePageBar profileBarState={profileBarState} setProfileBarState={setProfileBarState}/>
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
                    <hr className="w-100" style={{transform:'scale(1.5, 1)'}}/>
                    <div className="d-flex">
                        <ProfilePageBarButton text={"Posts"} selected={profileBarNum===1} setSelected={function (): void {
                            setProfileBarNum(1);
                        } }/>
                        <ProfilePageBarButton text={"About"} selected={profileBarNum===2} setSelected={function (): void {
                            setProfileBarNum(2);
                        } }/>
                        <ProfilePageBarButton text={"More"} selected={profileBarNum===3} setSelected={function (): void {
                            setProfileBarNum(3);
                        } }/>
                    </div>
                </div>
            </div>

            </>
            )
}

export default ProfileImageResponsiveComponent