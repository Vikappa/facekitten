import { BsPeopleFill } from "react-icons/bs";
import { BsPeople } from "react-icons/bs";

const GroupSquaredButton = ({selected}: {selected: boolean}) => {

    if(selected){
        return(
            <BsPeopleFill className="fs-2 text-primary"/>
        )
    } else {
        return(
            <BsPeople className="fs-2"/>
        )
    }
}

export default GroupSquaredButton
