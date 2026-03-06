'use client'
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

interface ProfileModalRectangleProps{
    onClick? : () => void
    text:string;
    icon: React.ReactNode;
}

export default function ProfileModalRectangle(props: ProfileModalRectangleProps){

    return(
        <div className="group flex items-center gap-2 my-1 rounded-xl px-2 py-1 transition-colors duration-200 hover:bg-gray-100 active:bg-gray-100">
            <div className="bg-secondary flex align-items-center justify-content-center rounded-full p-2 transition-colors duration-200 group-hover:bg-gray-200 group-active:bg-gray-200">
                {props.icon}
            </div>
            <span className="text-md m-0 flex items-center transition-colors duration-200 group-hover:text-black group-active:text-black">
                {props.text}
            </span>
            <MdOutlineKeyboardArrowRight
                onClick={props.onClick}
                className="ms-auto transition-colors duration-200 group-hover:text-black group-active:text-black"
                size={40}
            />
        </div>
    )
}
