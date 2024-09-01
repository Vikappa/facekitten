'use client'
import { Button } from "react-bootstrap"
import { fetchRandomProfilePictureCat, sortRandomProfilePictureQuery } from "../utils/Various";
import { useEffect, useState } from "react";
import RoundGreyBorderLess from "./RoundActivableButton";
import { FaChevronDown } from "react-icons/fa6";
import { storageData } from "../utils/StorageDataTypes";
import DeskTopProfileDropdown from "../components/DesktopProfileDropdown";

const ProfileRoundButton = (
    {selected, handleProfileButtonButton, storageData }:
    { selected: boolean; handleProfileButtonButton():void; storageData:storageData}) => {

    const [randomProfilepictureUrl, setRandomProfilePictureUrl]= useState<string>('')
    const [showDropDown, setShowDropDown] = useState<boolean>(false)
    const [storageDataState, setStorageDataState] = useState<storageData>(storageData)

    const handleClick = () => {
        handleProfileButtonButton()
        setShowDropDown(!showDropDown)
    }

    useEffect(() => {
        if(!selected){
            setShowDropDown(false)
        }
    }, [selected])
    

    useEffect(() => {
        if (storageData.userDetails.profilepicture === '') {
            fetchRandomProfilePictureCat(sortRandomProfilePictureQuery())
                .then(data => {
                    setRandomProfilePictureUrl(data);
                    console.log(data)
                    const updatedData = {
                        ...storageData,
                        userDetails: {
                            ...storageData.userDetails,
                            profilepicture: data
                        }
                    };
                    setStorageDataState(updatedData);
                    localStorage.setItem('facekittenData', JSON.stringify(updatedData));
                })
                .catch(error => {
                    console.error("Errore nel fetch della foto del profilo:", error);
                });
        } else {
            setRandomProfilePictureUrl(storageData.userDetails.profilepicture)
        }
    }, [storageData]);
    

    return (

        <div className="p-0 m-0 position-relative">
        <Button 
        onClick={handleClick}
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
            onClick={handleClick} size={0}        
        />
        </div>
        <DeskTopProfileDropdown show={showDropDown} storageData={storageData} />
        </div>
    )
}

export default ProfileRoundButton