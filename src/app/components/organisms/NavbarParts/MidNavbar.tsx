'use client'

import { useState } from "react";
import { FaGamepad, FaHome, FaStore, FaUsers } from "react-icons/fa";
import MidNavbarButtonFunction from "./MidNavbarButtonFunction";

export default function Midnavbar(){
    const midNavbarButtonClassName = "text-dark-400 px-7 py-2 rounded-lg transition-colors duration-100";
    const [isHomeButtonActive, setIsHomeButtonActive] = useState(false);
    const [isMarketplaceButtonActive, setIsMarketplaceButtonActive] = useState(false);
    const [isGroupsButtonActive, setIsGroupsButtonActive] = useState(false);
    const [isVideogamesButtonActive, setIsVideogamesButtonActive] = useState(false);

    

    const setExclusiveActive = (
        button: "home" | "marketplace" | "groups" | "videogames",
        isActive: boolean
    ) => {
        setIsHomeButtonActive(button === "home" ? isActive : false);
        setIsMarketplaceButtonActive(button === "marketplace" ? isActive : false);
        setIsGroupsButtonActive(button === "groups" ? isActive : false);
        setIsVideogamesButtonActive(button === "videogames" ? isActive : false);
    };

    return (
        <div className="hidden md:flex items-center gap-2">
            <MidNavbarButtonFunction
                icon={<FaHome className="text-2xl" />}
                onClick={(nextState) => setExclusiveActive("home", nextState)}
                isActive={isHomeButtonActive}
                className={midNavbarButtonClassName}
            />
            <MidNavbarButtonFunction
                icon={<FaStore className="text-2xl" />}
                onClick={(nextState) => setExclusiveActive("marketplace", nextState)}
                isActive={isMarketplaceButtonActive}
                className={midNavbarButtonClassName}
            />
            <MidNavbarButtonFunction
                icon={<FaUsers className="text-2xl" />}
                onClick={(nextState) => setExclusiveActive("groups", nextState)}
                isActive={isGroupsButtonActive}
                className={midNavbarButtonClassName}
            />
            <MidNavbarButtonFunction
                icon={<FaGamepad className="text-2xl" />}
                onClick={(nextState) => setExclusiveActive("videogames", nextState)}
                isActive={isVideogamesButtonActive}
                className={midNavbarButtonClassName}
            />
        </div>
    )
}
