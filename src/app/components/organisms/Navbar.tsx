'use client'
import { useAppSelector } from "@/lib/redux/hooks";
import Image from "next/image";
import { MutableRefObject } from "react";
import Link from "next/link";
import NavBarSearchLeft from "../cells/NavbarParts/NavBarSearchLeft";
import NavbarFunctions from "../cells/NavbarParts/NavBarFunctions";
import Midnavbar from "../cells/NavbarParts/MidNavbar";

interface NavbarProps {
    navbarRef: MutableRefObject<HTMLDivElement | null>;
}

export default function Navbar({ navbarRef }: NavbarProps) {
    const isSmallSearchBarVisible = useAppSelector((state) => state.ui.isSmallSearchBarVisible);

    return (
        <div className="sticky top-0 z-40 w-full bg-white shadow-sm py-2 px-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center" ref={navbarRef}>
            <div className="flex min-w-0 justify-self-start">
                <Link href={"/"} >
                    <Image src="/img/facekittenlogo.png" alt="FaceKitten Logo" width={40} height={40} />
                </Link>
                <NavBarSearchLeft />
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
