import { IoGameControllerOutline } from "react-icons/io5";
import { IoGameControllerSharp } from "react-icons/io5";

const GamesSquaredButton = ({selected}: {selected: boolean}) => {

    if(selected){
        return(
            <IoGameControllerOutline   />
        )
    } else {
        return(
            <IoGameControllerSharp  />
        )
    }
}

export default GamesSquaredButton