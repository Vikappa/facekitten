'use client'
import { Button } from "react-bootstrap"
import { fetchRandomProfilePictureCat, sortRandomProfilePictureQuery } from "../utils/Various";
import { useEffect, useState } from "react";
import RoundGreyBorderLess from "./RoundActivableButton";
import { FaChevronDown } from "react-icons/fa6";

const ProfileRoundButton = ({selected, handleProfileButtonButton }:{ selected: boolean; handleProfileButtonButton(selected:boolean):void }) => {

    const [randomProfilepictureUrl, setRandomProfilePictureUrl]= useState<string>('')
    const [showDropDown, setShowDropDown] = useState<boolean>(false)
    useEffect(() => {
        fetchRandomProfilePictureCat(sortRandomProfilePictureQuery())
        .then(data => {
            setRandomProfilePictureUrl(data)
        })
    }, [])
    

    return (

        <div className="p-0 m-0 position-relative">
        <Button 
        onClick={function (): void {
            setShowDropDown(!showDropDown)
        } }
        size="lg"
        className={`
        border-0
        d-flex justify-content-center align-items-center
        rounded-circle
        background
        d-none d-sm-block        
        fs-2
        `
        }
    style={{
        backgroundImage:`url(${randomProfilepictureUrl})`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        width: '40px', 
        height: '40px', 
        minWidth: '40px', 
        minHeight: '40px', 
        borderRadius: '50%',
    }}
        >
        </Button>
        <div 
        className="position-absolute top-0 right-0"
        style={{transform: 'translate(30%, 30%) scale(0.4)'}}
        >
            <RoundGreyBorderLess 
            bgSelected={"bg-primary"} 
            bgNotSelected={"bg-grayBg"} 
            iconSelected={<FaChevronDown />} 
            iconUnselected={<FaChevronDown />} 
            selected={showDropDown}
            onClick={function (): void {
                    setShowDropDown(!showDropDown)
                } } size={0}        
        />
        </div>
        </div>
    )
}

export default ProfileRoundButton