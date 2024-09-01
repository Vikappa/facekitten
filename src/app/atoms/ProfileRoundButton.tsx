'use client'
import { Button } from "react-bootstrap"
import { fetchRandomProfilePictureCat, sortRandomProfilePictureQuery } from "../utils/Various";
import { useEffect, useState } from "react";

const ProfileRoundButton = ({selected, handleProfileButtonButton }:{ selected: boolean; handleProfileButtonButton(selected:boolean):void }) => {

    const [randomProfilepictureUrl, setRandomProfilePictureUrl]= useState<string>('')

    useEffect(() => {
        fetchRandomProfilePictureCat(sortRandomProfilePictureQuery())
        .then(data => {
            setRandomProfilePictureUrl(data)
        })
    }, [])
    
    const showDropdownUserDesktop = () => {
        
    }

    return (

        <div className="p-0 m-0">
        <Button 
        onClick={showDropdownUserDesktop}
        size="lg"
        className={`
        border-0
        d-flex justify-content-center align-items-center
        rounded-circle
        p-2 m-0
        background
        d-none d-sm-block        
        fs-2
        `
        }
    style={{
        backgroundImage:`url(${randomProfilepictureUrl})`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
    }}
        >
        </Button>
        </div>
    )
}

export default ProfileRoundButton