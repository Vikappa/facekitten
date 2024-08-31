import { GoHomeFill } from "react-icons/go";
import { GoHome } from "react-icons/go";

const HomeSquaredButton = ({selected}: {selected: boolean}) => {

    if(selected){
        return(
            <GoHomeFill />
        )
    } else {
        return(
            <GoHome />
        )
    }
}

export default HomeSquaredButton