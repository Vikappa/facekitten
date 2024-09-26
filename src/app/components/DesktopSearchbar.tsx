'use client'
import Image from "next/image"
import { useState } from "react";
import { Form } from "react-bootstrap"
import { CiSearch } from "react-icons/ci";
import { useAppDispatch } from "../lib/hooks";
import { setNavbarPage, setShowDropDownNotification, setShowProfileDropDown } from "../lib/slices/appStateSlice";
import { useRouter } from "next/navigation";

const DesktopSearchbar = () => {

    const [searchValue, setSearchValue] = useState('')
    const dispatch = useAppDispatch()
    const router = useRouter()
    const setPage1 = () => {
        dispatch(setShowDropDownNotification(false))
        dispatch(setShowProfileDropDown(false))
        router.push('/')
        setNavbarPage(1)
    }

    return(
        <div className="d-none d-sm-flex align-items-center gap-3">
        <Image src={'/img/facekittenlogo.png'} alt="Logo" width={50} height={50} onClick={setPage1} style={{
            cursor:'pointer'
        }}/>
        {(searchValue.length === 0 ) && <CiSearch className="position-absolute" style={{transform:'translate(300%,0)'}} size={25}/>}
        <Form className="d-none d-sm-block">
            <Form.Control type="text" 
            placeholder={`      Cerca su meowbook`} 
            className="bg-grayBg rounded-pill border-0 p-2" 
            value={searchValue} 
            onChange={(e) => {setSearchValue(e.target.value)}}>
            </Form.Control>
        </Form>
        </div>
    )
}

export default DesktopSearchbar