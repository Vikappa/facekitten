import { BsPeopleFill } from "react-icons/bs";
import { BsPeople } from "react-icons/bs";

const GroupSquaredButton = ({selected}: {selected: boolean}) => {

    if(selected){
        return(
            <BsPeople  />
        )
    } else {
        return(
            <BsPeopleFill  />
        )
    }
}

export default GroupSquaredButton