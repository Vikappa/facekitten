import { useState } from "react";
import RoundGreyBorderLess from "../atoms/RoundActivableButton"
import { PiSquaresFourThin } from "react-icons/pi";
import { PiSquaresFourFill } from "react-icons/pi";

const DesktopProfileSection = () => {

    const [selected, setSelected] = useState(0)
    const handleFirstButton = () => {
        if(selected === 1){
            setSelected(0)
        } else {
            setSelected(1)
        }
    }

    return(
        <div className="d-flex align-items-center p-0 m-0">
            <RoundGreyBorderLess 
            iconSelected={<PiSquaresFourFill/>} 
            iconUnselected={<PiSquaresFourThin/>} 
            selected={(selected === 1)} 
            onClick={handleFirstButton}
            bgSelected="bg-quinary"
            bgNotSelected="bg-grayBg"
            size={30}
            />
        </div>
    )
}

export default DesktopProfileSection