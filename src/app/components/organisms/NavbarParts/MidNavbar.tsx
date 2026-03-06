'use client'

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setActiveMidNavbarTab, type MidNavbarTab } from "@/lib/redux/uiSlice";
import { FaGamepad, FaHome, FaStore, FaUsers } from "react-icons/fa";
import MidNavbarButtonFunction from "./MidNavbarButtonFunction";

export default function Midnavbar(){
    const dispatch = useAppDispatch();
    const activeMidNavbarTab = useAppSelector((state) => state.ui.activeMidNavbarTab);
    const midNavbarButtonClassName = "text-dark-400 px-7 py-2 rounded-lg transition-colors duration-100";

    const setExclusiveActive = (
        button: MidNavbarTab,
        isActive: boolean
    ) => {
        dispatch(setActiveMidNavbarTab(isActive ? button : null));
    };

    return (
        <div className="hidden md:flex items-center gap-2">
            <MidNavbarButtonFunction
                icon={<FaHome className="text-2xl" />}
                onClick={(nextState) => setExclusiveActive("home", nextState)}
                isActive={activeMidNavbarTab === "home"}
                className={midNavbarButtonClassName}
            />
            <MidNavbarButtonFunction
                icon={<FaStore className="text-2xl" />}
                onClick={(nextState) => setExclusiveActive("marketplace", nextState)}
                isActive={activeMidNavbarTab === "marketplace"}
                className={midNavbarButtonClassName}
            />
            <MidNavbarButtonFunction
                icon={<FaUsers className="text-2xl" />}
                onClick={(nextState) => setExclusiveActive("groups", nextState)}
                isActive={activeMidNavbarTab === "groups"}
                className={midNavbarButtonClassName}
            />
            <MidNavbarButtonFunction
                icon={<FaGamepad className="text-2xl" />}
                onClick={(nextState) => setExclusiveActive("videogames", nextState)}
                isActive={activeMidNavbarTab === "videogames"}
                className={midNavbarButtonClassName}
            />
        </div>
    )
}
