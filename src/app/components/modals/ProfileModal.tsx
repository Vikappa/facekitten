'use client';
import { useAppSelector } from "@/lib/redux/hooks";
import Image from "next/image";
import { MutableRefObject, useEffect, useState } from "react";

interface ProfileModalProps {
    navbarRef: MutableRefObject<HTMLDivElement | null>;
}

export default function ProfileModal({ navbarRef }: ProfileModalProps) {
    const isOpen = useAppSelector((state) => state.ui.activeNavFunction === "profile");
    const [navbarHeight, setNavbarHeight] = useState(0);

    useEffect(() => {
        if (!isOpen) return;

        const navbarElement = navbarRef.current;
        if (!navbarElement) return;

        const updateNavbarHeight = () => {
            setNavbarHeight(navbarElement.getBoundingClientRect().height);
        };

        updateNavbarHeight();

        const resizeObserver = new ResizeObserver(updateNavbarHeight);
        resizeObserver.observe(navbarElement);
        window.addEventListener("resize", updateNavbarHeight);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateNavbarHeight);
        };
    }, [isOpen, navbarRef]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            style={{ top: `${navbarHeight}px` }}
            className="absolute w-full p-2 flex flex-col items-center align-content-center"
        >
            <div className="w-full flex flex-col bg-blue-500 p-5">
                <div className="w-full flex bg-white p-3" >
                    <div className="relative w-10 h-10">
                        <Image src="/assets/blankprofile.png" alt="Profile Picture" fill className="rounded-full mx-auto" />
                    </div>
                    <div className="flex align-bottom justify-content-center m-3">
                        <p>Name</p>
                    </div>
                </div>
                <hr className="mt-3"/>
                <div className="w-full flex justify-center" >
                    <div className="bg-tertiary m-3 flex align-items-center w-full">
                        <button className="bg-red-400 py-3  px-5">Tutti i profili</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
