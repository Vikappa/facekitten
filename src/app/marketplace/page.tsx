'use client'
import { useRef, useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MessengerPageOrg from "../organisms/MessengerPage";
import '../style.css';
import ModaleNotificationMobileModale from "../modali/ModaleNotificationMobileModale";
import MobileOptionFullScreenModal from "../modali/MobileOptionFullScreenModal";

const MessengerPage = () => {
    const navBarRef = useRef<HTMLDivElement | null>(null); 
    const [remainingHeight, setRemainingHeight] = useState<number>(0);

    useEffect(() => {
        const handleResize = () => {
            if (navBarRef.current) {
                const navbarHeight = navBarRef.current.clientHeight;  
                setRemainingHeight(window.innerHeight - navbarHeight);  
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize(); 

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="d-flex flex-column" style={{ height: '100vh' }}>
            <ModaleNotificationMobileModale />
            <MobileOptionFullScreenModal/>
            <div ref={navBarRef}>  
                <NavBar />
            </div>
                <MessengerPageOrg remainingHeight={remainingHeight}/>
        </div>
    );
}

export default MessengerPage;
