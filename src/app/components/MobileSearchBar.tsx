'use client'
import { useEffect, useState } from "react"
import { Form } from "react-bootstrap"
import { CiSearch } from "react-icons/ci";
import Image from "next/image";
import RoundActivableButton from '../atoms/RoundActivableButton'
import { GoArrowLeft } from "react-icons/go";

const MobileSearchBar = (
    {showMobileSearch, setShowMobileSearch, setSelected }:
    {showMobileSearch:boolean;
    setShowMobileSearch(showMobileSearch:boolean):void;
    setSelected(selected:number):void
    }) => {

    const [searchValue, setSearchValue] = useState('')
    useEffect(() => {
        setSelected(0)
    }, [showMobileSearch, setSelected])
    

    return(
        <div className="d-block d-sm-none">
            <Form className="d-flex position-relative align-items-center gap-3">
                {
                    showMobileSearch ?
                    <>
                    <RoundActivableButton
                    iconSelected={<GoArrowLeft />}
                    iconUnselected={<GoArrowLeft />}
                    selected={false}
                    onClick={() => {setShowMobileSearch(false)}}
                    bgSelected={'bg-grayBg'}
                    bgNotSelected={'bg-grayBg'}
                    size={22}
                    />
                    {(searchValue.length === 0) && <CiSearch className="position-absolute" style={{transform:'translate(290%,5%)'}} size={22}/>}
                    <Form.Control 
                    type="text" 
                    placeholder={`     cerca su meowbook`} 
                    className="bg-grayBg rounded-pill border-0 p-2" 
                    value={searchValue}
                    onChange={(e) => {setSearchValue(e.target.value)}}
                    >
                    </Form.Control>
                    </>
                    :
                    <>
                    <Image src={'/img/facekittenlogo.png'} alt="Logo" width={42} height={42}/>
                    <RoundActivableButton bgSelected={'bg-grayBg'} bgNotSelected={'bg-grayBg'} iconSelected={<CiSearch/>} iconUnselected={<CiSearch/>} selected={false} onClick={() => setShowMobileSearch(true)} size={24}/>
                    </>
                }

            </Form>
        </div>
    )
}

export default MobileSearchBar