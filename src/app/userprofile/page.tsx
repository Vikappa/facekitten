'use client'
import '../style.css'
import  Navbar  from "../components/NavBar"
import ModaleNotificationMobileModale from "../modali/ModaleNotificationMobileModale"
import UserProfileRenderer from "../organisms/UserProfileRenderer"
import MobileOptionFullScreenModal from '../modali/MobileOptionFullScreenModal'

const UserProfilePage = () => {

    return(
        <div id="container bg-danger">
            <ModaleNotificationMobileModale/>
            <MobileOptionFullScreenModal />
            <Navbar/>
                <UserProfileRenderer/>
        </div>
    )
}

export default UserProfilePage