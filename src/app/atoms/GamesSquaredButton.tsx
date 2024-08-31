import { IoGameControllerOutline } from "react-icons/io5";
import { IoGameControllerSharp } from "react-icons/io5";

const GamesSquaredButton = ({selected}: {selected: boolean}) => {

    if(selected){
        return(
            <IoGameControllerSharp className="fs-2 text-primary" />
        )
    } else {
        return(
            <IoGameControllerOutline className="fs-2"  />
        )
    }
}

export default GamesSquaredButton