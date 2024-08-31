'use client'
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap"
import { getProfilePicture } from "../utils/Various";

const ProfileRoundButton = ({selected, handleProfileButtonButton }:{ selected: boolean; handleProfileButtonButton(selected:boolean):void }) => {

    const  randomProfilepictureUrl = getProfilePicture()

    const showDropdownUserDesktop = () => {
        
    }

    return (

        <div className="p-0 m-0">
        <Button 
        onClick={showDropdownUserDesktop}
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
        backgroundImage:`url(${randomProfilepictureUrl})`
    }}
        >
        </Button>
        </div>
    )
}

export default ProfileRoundButton