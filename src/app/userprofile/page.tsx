'use client'

import  Navbar  from "../components/NavBar"
import UserProfileRenderer from "../organisms/UserProfileRenderer"

const UserProfilePage = () => {

    return(
        <div id="container bg-danger">
            <Navbar/>
                <UserProfileRenderer/>
        </div>
    )
}

export default UserProfilePage