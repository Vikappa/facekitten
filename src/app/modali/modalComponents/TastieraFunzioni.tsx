'use client'
import SquaredOptButton from "@/app/atoms/SquaredOptButton";
import { BsCameraReelsFill } from "react-icons/bs";
import { MdGroups } from "react-icons/md";
import { FaVideo } from "react-icons/fa";
import { IoFlagSharp } from "react-icons/io5";
import { RiMemoriesFill } from "react-icons/ri";
import { IoSadSharp } from "react-icons/io5";
import { FaFacebookMessenger } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { BsShop } from "react-icons/bs";
import { IoBookmarkSharp } from "react-icons/io5";
import { FaCalendar } from "react-icons/fa";
import { IoBrowsers } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/lib/hooks";
import { setShowProfileDropDown } from "@/app/lib/slices/appStateSlice";

const TastieraFunzioni = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const pushToAmici = () => {
        dispatch(setShowProfileDropDown(false))
        router.push('/amici')
    }

    const fakeFunction = () =>{
    }

    return(
    <div className="row">
        <div className="col-6">

            <SquaredOptButton 
            text="Reels" 
            icon={<BsCameraReelsFill />} 
            onClick={fakeFunction} 
            />
            
            
            <SquaredOptButton 
            text="Gruppi" 
            icon={<MdGroups />} 
            onClick={fakeFunction} 
            />
            
            
            <SquaredOptButton 
            text="Video" 
            icon={<FaVideo />} 
            onClick={fakeFunction} 
            />
            
            
            <SquaredOptButton 
            text="Pagine" 
            icon={<IoFlagSharp />} 
            onClick={fakeFunction} 
            />
            
            
            <SquaredOptButton 
            text="Ricordi" 
            icon={<RiMemoriesFill />} 
            onClick={fakeFunction} 
            />
            
            
            <SquaredOptButton 
            text="Ads Manager" 
            icon={<IoSadSharp />} 
            onClick={fakeFunction} 
            />
            

        </div>
        <div className="col-6">

            <SquaredOptButton 
            text="Messenger" 
            icon={<FaFacebookMessenger />} 
            onClick={fakeFunction} 
            />
            
            
            <SquaredOptButton 
            text="A-Mici" 
            icon={<FaUserFriends />} 
            onClick={pushToAmici} 
            />
            
            
            <SquaredOptButton 
            text="Marketplace" 
            icon={<BsShop />} 
            onClick={fakeFunction} 
            />
            
            
            <SquaredOptButton 
            text="Salvati" 
            icon={<IoBookmarkSharp />} 
            onClick={fakeFunction} 
            />
            
            
            <SquaredOptButton 
            text="Events" 
            icon={<FaCalendar />} 
            onClick={fakeFunction} 
            />
            
            
            <SquaredOptButton 
            text="Feeds" 
            icon={<IoBrowsers />} 
            onClick={fakeFunction} 
            />
            

        </div>
    </div>
    )
}

export default TastieraFunzioni;