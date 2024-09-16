'use client'
import { useRef, useState, useEffect, useCallback } from "react";
import NavBar from "../components/NavBar";
import MessengerPageOrg from "../organisms/MessengerPage";
import '../style.css';
import ModaleNotificationMobileModale from "../modali/ModaleNotificationMobileModale";
import MobileOptionFullScreenModal from "../modali/MobileOptionFullScreenModal";

const MessengerPage = () => {


    return (
        <div className="d-flex flex-column" style={{ height: '100vh' }}>
            <ModaleNotificationMobileModale />
            <MobileOptionFullScreenModal/>
            <NavBar/>
            <div style={{ flex: 1 }}>
                <MessengerPageOrg />
            </div>
        </div>
    );
}

export default MessengerPage;
