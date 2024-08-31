'use client'
import { useState } from "react"
import { Form } from "react-bootstrap"
import { CiSearch } from "react-icons/ci";
import Image from "next/image";
import RoundActivableButton from '../atoms/RoundActivableButton'
import { GoArrowLeft } from "react-icons/go";

const MobileSearchBar = () => {

    const [showSearch, setShowSearch] = useState(false)
    const [searchValue, setSearchValue] = useState('')


    return(
        <div className="d-block d-sm-none">
            <Form className="d-flex position-relative align-items-center gap-3">
                {
                    showSearch ?
                    <>
                    <RoundActivableButton
                    iconSelected={<GoArrowLeft />}
                    iconUnselected={<GoArrowLeft />}
                    selected={false}
                    onClick={() => {setShowSearch(false)}}
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
                    <RoundActivableButton bgSelected={'bg-grayBg'} bgNotSelected={'bg-grayBg'} iconSelected={<CiSearch/>} iconUnselected={<CiSearch/>} selected={false} onClick={() => setShowSearch(true)} size={24}/>
                    </>
                }

            </Form>
        </div>
    )
}

export default MobileSearchBar