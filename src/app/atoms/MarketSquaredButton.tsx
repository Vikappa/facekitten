import { CiShop } from "react-icons/ci";
import { AiFillShop } from "react-icons/ai";

const MarketSquaredButton = ({selected}: {selected: boolean}) => {
        return(
            selected?
            <AiFillShop className="fs-2 text-primary" />
            :
            <CiShop className="fs-2" style={{ strokeWidth: 0.5 }} />
        )
}

export default MarketSquaredButton