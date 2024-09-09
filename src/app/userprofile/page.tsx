'use client'

import  Navbar  from "../components/NavBar"
import ModaleNotificationMobileModale from "../modali/ModaleNotificationMobileModale"
import UserProfileRenderer from "../organisms/UserProfileRenderer"

const UserProfilePage = () => {

    return(
        <div id="container bg-danger">
                  <ModaleNotificationMobileModale/>

            <Navbar/>
                <UserProfileRenderer/>
        </div>
    )
}

export default UserProfilePage