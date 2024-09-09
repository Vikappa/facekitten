'use client'

import  Navbar  from "../components/NavBar"
import UserProfileRenderer from "../organisms/UserProfileRenderer"
import StoreMonitor from "../utils/StoreMonitorComponent"

const UserProfilePage = () => {

    return(
        <div id="container bg-danger">
            <Navbar/>
            <div className="row align-items-center d-flex justify-content-center justify-content-sm-start">
                <UserProfileRenderer/>
            </div>
        </div>
    )
}

export default UserProfilePage