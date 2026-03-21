'use client'
import Link from "next/link";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

interface ProfileModalRectangleProps {
    text: string;
    icon: React.ReactNode;
    onClick?: () => void;
    href?: string;
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
    showArrow: boolean;
}

export default function ProfileModalRectangle(props: ProfileModalRectangleProps) {
    const sharedClassName = "group my-1 flex items-center gap-2 rounded-xl px-2 py-1 text-left transition-colors duration-200 hover:bg-gray-100 active:bg-gray-100";
    const content = (
        <>
            <div className="bg-secondary flex align-items-center justify-content-center rounded-full p-2 transition-colors duration-200 group-hover:bg-gray-200 group-active:bg-gray-200">
                {props.icon}
            </div>
            <span className="text-md m-0 flex items-center transition-colors duration-200 group-hover:text-black group-active:text-black">
                {props.text}
            </span>

            {props.showArrow &&<MdOutlineKeyboardArrowRight
                className="ms-auto text-gray-500 transition-colors duration-200 group-hover:text-gray-700 group-active:text-black"
                size={40}
            />}
        </>
    );

    if (props.href) {
        const rel = props.target === "_blank" ? props.rel ?? "noopener noreferrer" : props.rel;

        return (
            <Link
                href={props.href}
                target={props.target}
                rel={rel}
                onClick={props.onClick}
                className={sharedClassName}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={props.onClick}
            className={`${sharedClassName} w-full`}
        >
            {content}
        </button>
    )
}
