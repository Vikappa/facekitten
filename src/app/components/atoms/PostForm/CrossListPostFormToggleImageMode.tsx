'use client'

import { useState } from "react";
import { IoMdPhotos } from "react-icons/io";
interface CrossListPostFormToggleImageModeProps {
    functionProp: (val:boolean) => void;
}
export function CrossListPostFormToggleImageMode({functionProp }: CrossListPostFormToggleImageModeProps) {

    const [active, setActive] = useState(false);

    function activateButton() {
        setActive(!active);
        functionProp?.(!active);
    }
    return (
        <div
            className={`
        flex items-center justify-center
        rounded-full
      `}
        >
            <IoMdPhotos
                size={20}
                onClick={activateButton}
                className={`cursor-pointer ${active ? "text-blue-600" : "text-black"}`}
            />
        </div>
    );

}