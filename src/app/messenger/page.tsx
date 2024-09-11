'use client'
import { useRef, useState, useEffect, useCallback } from "react";
import NavBar from "../components/NavBar";
import MessengerPageOrg from "../organisms/MessengerPage";
import '../style.css';

const MessengerPage = () => {
    const [navbarHeight, setNavbarHeight] = useState<number>(0);
    const navBarRef = useRef<HTMLDivElement | null>(null);

    const updateNavbarHeight = useCallback(() => {
        if (navBarRef.current) {
            setNavbarHeight(navBarRef.current.getBoundingClientRect().height);
        }
    }, [navBarRef]);

    useEffect(() => {
        updateNavbarHeight();
        window.addEventListener('resize', updateNavbarHeight);

        return () => {
            window.removeEventListener('resize', updateNavbarHeight);
        };
    }, [updateNavbarHeight]);

    return (
        <div className="d-flex flex-column" style={{ height: '100vh' }}>
            <NavBar ref={navBarRef} />
            <div style={{ flex: 1 }}>
                <MessengerPageOrg navbarHeight={navbarHeight} />
            </div>
        </div>
    );
}

export default MessengerPage;

