'use client'

import Image from "next/image";

interface NavbarButtonFunctionProps {
    icon: React.ReactNode;
    onClick: (v: boolean) => void;
    isActive: boolean;
    className: string;
}

export default function NavbarButtonFunction(props: NavbarButtonFunctionProps) {


    const handleClick = () => {
        props.onClick(!props.isActive);
    }

    return (
        <button 
        onClick={handleClick} 
        className={`${props.className} border-b-2 ${props.isActive ? "text-primary border-primary" : "border-transparent"} transition-[color,border-color] duration-300 ease-in`}
        >
            {props.icon}
        </button>
    )
}

interface ProfilePctureProps {
    imageSrc: string;
    alt: string;
    onClick: () => void;
    isActive: boolean;
    setIsActive: (active: boolean) => void;
    className: string;

}
export function ProfilePicture(props: ProfilePctureProps) {

    const handleClick = () => {
        props.onClick();
        props.setIsActive(!props.isActive);
    }

    return (
        <button
            onClick={handleClick}
            className={`${props.className} transition-[filter] duration-300 ease-in`}
            style={{
                filter: props.isActive ? "sepia(1) saturate(7) hue-rotate(175deg) brightness(0.95)" : "none",
            }}
        >
            <Image
                src={props.imageSrc}
                alt={props.alt}
                width={37}
                height={37}
                className="rounded-full"
            />
        </button>
    )
}
