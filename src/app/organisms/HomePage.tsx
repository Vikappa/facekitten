import NavBar from "../components/NavBar"
import { storageData } from "../utils/StorageDataTypes"

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