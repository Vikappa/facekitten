'use client'
import { RiMessengerLine } from "react-icons/ri";
import { Button } from "react-bootstrap"
import { useAppSelector } from "../lib/hooks";
import MessengerDropDown from "./MessengerDropDown";

const MessengerButton = ({onClick}:{ onClick:()=>void}) => {    
    const selected = useAppSelector(state => state.status.showMessengerDropDown)
    return (
        <Button 
        onClick={onClick}
        className={`
        ${selected?`bg-quinary`:`bg-grayBg`} 
        border-0
        d-flex justify-content-center align-items-center
        rounded-circle
        p-2 m-0
        position-relative
        ${selected?`text-primary`:`text-black`} 
        
        fs-2
        `}
        >
            <RiMessengerLine />
            <MessengerDropDown/>
        </Button>
    )
}

export default MessengerButton