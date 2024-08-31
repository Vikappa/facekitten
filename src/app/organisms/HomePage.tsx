import NavBar from "../components/NavBar"
import { storageData } from "../utils/CustomTypes"

const HomePage = (
    {data}: {data: storageData}
) => {
    return (
        <div>
            <NavBar/>
        </div>
    )
}

export default HomePage