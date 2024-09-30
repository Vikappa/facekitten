'use client'
import { PiVideoFill } from "react-icons/pi";
import { RiLiveFill } from "react-icons/ri";
import ReelLi from "../atoms/ReelLi"
import { BsCameraReelsFill } from "react-icons/bs";
import { PiFilmReelFill } from "react-icons/pi";
import { FaRocket } from "react-icons/fa";
import { FaBookmark } from "react-icons/fa";

const DesktopReelSidebar = () => {

    return(
        <ul className="
        p-0
        ">
            <ReelLi titolo={'Home'} icona={<PiVideoFill />}/>
            <ReelLi titolo={'Live'} icona={<RiLiveFill />}/>
            <ReelLi titolo={'Reels'} icona={<BsCameraReelsFill />}/>
            <ReelLi titolo={'Shows'} icona={<PiFilmReelFill />}/>
            <ReelLi titolo={'Explore'} icona={<FaRocket />}/>
            <ReelLi titolo={'Saved videos'} icona={<FaBookmark />}/>
            </ul>
    )
}

export default DesktopReelSidebar