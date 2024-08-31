import RoundGreyBorderLess from "../atoms/RoundActivableButton";
import { IoMdMenu } from "react-icons/io";

const MobileProfileSection = ({
    showMobileSearch, setShowMobileSearch, selected, setSelected
    }:{
        showMobileSearch:boolean;
        setShowMobileSearch(showMobileSearch:boolean):void;
        selected:number;
        setSelected(selected:number):void
    }) => {

        const handleSelectedMobileMenu = () => {
            setSelected(8)
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