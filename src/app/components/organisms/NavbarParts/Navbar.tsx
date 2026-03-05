'use client'
import Image from "next/image";
import Midnavbar from "./MidNavbar";
import NavbarFunctions from "./NavBarFunctions";
import NavBarSearchLeft from "./NavBarSearchLeft";
import { useState } from "react";


export default function Navbar() {
    const [isSmallSearchBarVisible, setIsSmallSearchBarVisible] = useState(false);

    return (
        <div className="w-full bg-white shadow-sm py-2 px-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center" >
            <div className="flex min-w-0 justify-self-start">
                <Image src="/img/facekittenlogo.png" alt="FaceKitten Logo" width={40} height={40} />
                <NavBarSearchLeft
                    isSmallSearchBarVisible={isSmallSearchBarVisible}
                    setIsSmallSearchBarVisible={setIsSmallSearchBarVisible}
                />
            </div>
            <div className="justify-self-center">
                <Midnavbar />
            </div>
            <div className="justify-self-end">
                {
                    !isSmallSearchBarVisible &&
                    (
                        <NavbarFunctions />
                    )
                }
            </div>
        </div>
    )
}
