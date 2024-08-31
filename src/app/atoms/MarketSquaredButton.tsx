import { CiShop } from "react-icons/ci";
import { AiFillShop } from "react-icons/ai";

const MarketSquaredButton = ({selected}: {selected: boolean}) => {

    if(selected){
        return(
            <AiFillShop  />
        )
    } else {
        return(
            <CiShop />
        )
    }
}

export default MarketSquaredButton