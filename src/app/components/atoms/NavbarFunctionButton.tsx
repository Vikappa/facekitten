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
        className={`${props.className} ${props.isActive ? "text-primary bg-secondary" : ""} transition-[color,background-color] duration-300 ease-in`}
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
            <span className="relative block h-[37px] w-[37px] shrink-0 overflow-hidden rounded-full">
                <Image
                    src={props.imageSrc}
                    alt={props.alt}
                    fill
                    sizes="37px"
                    className="object-cover"
                />
            </span>
        </button>
    )
}
