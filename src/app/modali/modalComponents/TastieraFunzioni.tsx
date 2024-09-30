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
import { setNavbarPage, setShowProfileDropDown, updateShowOptionsModal } from "@/app/lib/slices/appStateSlice";

const TastieraFunzioni = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const pushToAmici = () => {
        dispatch(setShowProfileDropDown(false))
        router.push('/amici')
    }

    const goToAuthorPage = () => {
        dispatch(setNavbarPage(30))
        dispatch(setShowProfileDropDown(false))
        dispatch(updateShowOptionsModal())
        router.push('/aboutme')
    }

    const logOutFunction = () => {
        localStorage.removeItem('persist:root')
        window.location.reload()
        router.push('/')
    }

    const fakeFunction = () =>{
    }

    return(
    <div className="row">

            <SquaredOptButton 
            text="Reels" 
            color="red"
            icon={<BsCameraReelsFill />} 
            onClick={fakeFunction} 
            />
            
            <SquaredOptButton 
            text="Messenger" 
            color="purple"
            icon={<FaFacebookMessenger />} 
            onClick={fakeFunction} 
            />
            
            <SquaredOptButton 
            text="Gruppi" 
            color="blue"
            icon={<MdGroups />} 
            onClick={fakeFunction} 
            />
            
            <SquaredOptButton 
            text="A-Mici" 
            color="blue"
            icon={<FaUserFriends />} 
            onClick={pushToAmici} 
            />

            <SquaredOptButton 
            text="Video" 
            color="skyblue"
            icon={<FaVideo />} 
            onClick={fakeFunction} 
            />
            
            <SquaredOptButton 
            text="Marketplace" 
            color="green"
            icon={<BsShop />} 
            onClick={fakeFunction} 
            />

            <SquaredOptButton 
            text="Pagine" 
            color="orange"
            icon={<IoFlagSharp />} 
            onClick={fakeFunction} 
            />
            
            <SquaredOptButton 
            text="Salvati" 
            color='violet'
            icon={<IoBookmarkSharp />} 
            onClick={fakeFunction} 
            />

            <SquaredOptButton 
            text="Ricordi" 
            color='blue'
            icon={<RiMemoriesFill />} 
            onClick={fakeFunction} 
            />
                        
            <SquaredOptButton 
            text="Events" 
            color='red'
            icon={<FaCalendar />} 
            onClick={fakeFunction} 
            />
            
            <SquaredOptButton 
            text="Log Out" 
            color='blue'
            icon={<IoSadSharp />} 
            onClick={logOutFunction} 
            />
            
            <SquaredOptButton 
            text="About me" 
            icon={<IoBrowsers />} 
            color='orange'
            onClick={goToAuthorPage} 
            />
            
    </div>
    )
}

export default TastieraFunzioni;