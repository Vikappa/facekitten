'use client'

import { useState } from "react";

interface NavbarButtonFunctionProps {
    icon: React.ReactNode;
    onClick: () => void;

}

export default function NavbarButtonFunction(props: NavbarButtonFunctionProps){

    const [isActive, setIsActive] = useState(false);

    const handleClick = () => {
        props.onClick();
        setIsActive(!isActive);
    }

    return(
        <div>
            <button onClick={handleClick} className="bg-tertiary text-white px-4 py-2 rounded-full hover:bg-secondary transition-colors duration-300">
                {props.icon}
            </button>
        </div>
    )
}