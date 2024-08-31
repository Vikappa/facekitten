import { GoHomeFill } from "react-icons/go";
import { GoHome } from "react-icons/go";

const HomeSquaredButton = ({selected}: {selected: boolean}) => {

        return(
            selected? 
            <GoHomeFill className="fs-2 text-primary" />
            :
            <GoHome className="fs-2"/>
        )
}

export default HomeSquaredButton