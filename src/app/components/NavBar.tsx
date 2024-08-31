import { useState } from "react"
import DesktopSearchbar from "./DesktopSearchbar"
import MobileSearchBar from "./MobileSearchBar"
import MidNavBar from "./MidNavBar"

const NavBar = () => {

    const [showSearch, setShowSearch] = useState(false)

    return(
    <div className="d-flex justify-content-between align-items-center bg-white shadow-sm p-1 px-3">
        <DesktopSearchbar/>
        <MobileSearchBar/>

        <MidNavBar/>

    </div>
    )
}

export default NavBar