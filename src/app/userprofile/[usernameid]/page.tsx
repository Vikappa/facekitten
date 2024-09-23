'use client'
import { useParams } from 'next/navigation'
import '../../style.css';
import Navbar from "../../components/NavBar";
import ModaleNotificationMobileModale from "../../modali/ModaleNotificationMobileModale";
import UserProfileRenderer from "../../organisms/UserProfileRenderer";
import MobileOptionFullScreenModal from '../../modali/MobileOptionFullScreenModal';

const UserBotPage = () => {
    const { usernameid } = useParams()

    return (
        <div id="container bg-danger">
            <ModaleNotificationMobileModale />
            <MobileOptionFullScreenModal />
            <Navbar />
            <h1>Profilo utente: {usernameid}</h1> 
        </div>
    );
}

export default UserBotPage;
