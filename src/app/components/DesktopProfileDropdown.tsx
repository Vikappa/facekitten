'use client'
import { useState, useEffect } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import { storageData } from '../utils/StorageDataTypes';
import Image from 'next/image';
import { IoSettingsSharp } from "react-icons/io5";
import RoundGreyBorderLess from '../atoms/RoundActivableButton';
import { MdContactSupport } from "react-icons/md";
import { TbZoomExclamationFilled } from "react-icons/tb";
import { IoLogOutSharp } from "react-icons/io5";
import { IoLogoOctocat } from "react-icons/io";

const DeskTopProfileDropdown = ({ show, storageData }: { show: boolean; storageData: storageData }) => {
    
    const [profileImage, setProfileImage] = useState(storageData.userDetails.profilepicture);

    useEffect(() => {
        if (storageData.userDetails.profilepicture) {
            setProfileImage(storageData.userDetails.profilepicture);
        }
    }, [storageData.userDetails.profilepicture]);

    const logOutFunction = () => {
        localStorage.removeItem('facekittenData')
        window.location.reload();
    }

    if (!show) return null;

    return (
        <ListGroup className='position-absolute end-0 bg-white shadow fw-bold' style={{ minWidth: '25vw' }}>
            <ListGroup.Item style={{cursor:'pointer'}} className='d-flex align-content-center align-items-center gap-2 m-1 rounded-2 border-0 liHoverEffect '>
                {profileImage && 
                    <Image 
                        src={profileImage} 
                        alt={storageData.userDetails.name} 
                        height={35} 
                        width={35} 
                        className='rounded-circle'
                    />}
                <div>
                    <p className="m-0">{storageData.userDetails.name}</p>
                </div>
            </ListGroup.Item>

            <ListGroup.Item style={{cursor:'pointer'}} className='d-flex align-content-center align-items-center gap-2 m-1  rounded-2 border-0 liHoverEffect cursor-pointer'>
                <div style={{ transform: 'scale(0.7)', position: 'absolute' }}>
                    <RoundGreyBorderLess
                        bgSelected={'bg-grayBg'}
                        bgNotSelected={'bg-grayBg'}
                        iconSelected={<IoSettingsSharp />}
                        iconUnselected={<IoSettingsSharp />}
                        selected={false}
                        onClick={function (): void { }}
                        size={8} />
                </div>
                <p className='p-0 m-0 ps-5'>Settings and privacy</p>
            </ListGroup.Item>
            <ListGroup.Item style={{cursor:'pointer'}} className='d-flex align-content-center align-items-center gap-2 m-1  rounded-2 border-0 liHoverEffect'>
                <div style={{ transform: 'scale(0.7)', position: 'absolute' }}>
                    <RoundGreyBorderLess
                        bgSelected={'bg-grayBg'}
                        bgNotSelected={'bg-grayBg'}
                        iconSelected={<MdContactSupport />}
                        iconUnselected={<MdContactSupport />}
                        selected={false}
                        onClick={function (): void { }}
                        size={8} />
                </div>
                <p className='p-0 m-0 ps-5'>Help and support!</p>
            </ListGroup.Item>
            <ListGroup.Item style={{cursor:'pointer'}} className='d-flex align-content-center align-items-center gap-2 m-1  rounded-2 border-0 liHoverEffect'>
                <div style={{ transform: 'scale(0.7)', position: 'absolute' }}>
                    <RoundGreyBorderLess
                        bgSelected={'bg-grayBg'}
                        bgNotSelected={'bg-grayBg'}
                        iconSelected={<TbZoomExclamationFilled />}
                        iconUnselected={<TbZoomExclamationFilled />}
                        selected={false}
                        onClick={function (): void { }}
                        size={8} />
                </div>
                <p className='p-0 m-0 ps-5'>Give Feedback</p>
            </ListGroup.Item>
            <ListGroup.Item style={{cursor:'pointer'}} onClick={logOutFunction} className='d-flex align-content-center align-items-center gap-2 m-1  rounded-2 border-0 liHoverEffect'>
                <div style={{ transform: 'scale(0.7)', position: 'absolute' }}>
                    <RoundGreyBorderLess
                        bgSelected={'bg-grayBg'}
                        bgNotSelected={'bg-grayBg'}
                        iconSelected={<IoLogOutSharp />}
                        iconUnselected={<IoLogOutSharp />}
                        selected={false}
                        onClick={logOutFunction}
                        size={8} />
                </div>
                <p className='p-0 m-0 ps-5'>LogOut</p>
            </ListGroup.Item>
            <ListGroup.Item className='d-flex align-content-center align-items-center gap-2'>
                <p style={{ fontSize: '0.8rem' }} className="d-flex fw-normal text-center align-items-center justify-content-center m-0 text-tertiary flex-nowrap"><IoLogoOctocat className="m-0" />
                    Mewta - All Rrrrrrrights Prrreserved</p>
            </ListGroup.Item>
        </ListGroup>
    )
}

export default DeskTopProfileDropdown
