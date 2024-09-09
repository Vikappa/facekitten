import RoundGreyBorderLess from "../atoms/RoundActivableButton";
import { IoMdMenu } from "react-icons/io";
import { useAppDispatch } from "../lib/hooks";
import { setShowDropDownNotification, setShowMobileSearch, setShowNotificationModal, setShowProfileDropDown, updateShowOptionsModal } from "../lib/slices/appStateSlice";

const MobileProfileSection = ({
     selected, setSelected
    }:{
        selected:number;
        setSelected(selected:number):void
    }) => {
        const dispatch = useAppDispatch()
        const handleSelectedMobileMenu = () => {
            setSelected(8)
            dispatch(updateShowOptionsModal())
            dispatch(setShowNotificationModal(false))
            dispatch(setShowDropDownNotification(false))
            dispatch(setShowProfileDropDown(false))
            dispatch(setShowMobileSearch(false))
        }

        return(
            <div className="d-flex d-sm-none align-items-center p-0 m-0 gap-2 ">
    
                <RoundGreyBorderLess 
                iconSelected={<IoMdMenu />} 
                iconUnselected={<IoMdMenu/>} 
                selected={(selected === 8)} 
                onClick={handleSelectedMobileMenu}
                bgSelected="bg-quinary"
                bgNotSelected="bg-grayBg"
                size={30}
                />
    
            </div>
        )
}

export default MobileProfileSection