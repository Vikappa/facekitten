'use client';

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSelector } from "react-redux";
import styles from "./NavBarUserButton.module.css";
import { RootState } from "@/lib/store";
import { UserData } from "@/lib/interfaces/CommonInterfaces";
import { BiSolidDownArrow } from "react-icons/bi";

interface NavbarUserButtonProps {
    size: number;
    color?: string;
}

export function NavBarUserButton({ size, color }: NavbarUserButtonProps) {
    const userProfile = useSelector(
        (state: RootState): UserData | null => state.userData.user
    );
    const UserButtonRef = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (
                UserButtonRef.current &&
                !UserButtonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    function openProfileModal() {
        setIsOpen(true)
    }

    if (userProfile && userProfile.avatarUrl) {
        return (
            <div
                ref={UserButtonRef}
                className="relative rounded-full cursor-pointer display-relative"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                }}
                onClick={openProfileModal}

            >
                <Image
                    src={userProfile.avatarUrl}
                    alt={userProfile.username}
                    fill
                    className="object-cover rounded-full overflow-hidden "
                    unoptimized
                />

                <BiSolidDownArrow
                    className={`absolute bottom-1 bg-white rounded-full right-1 ring-2 ring-white z-20 ${isOpen ? `text-blue-600` : `text-black`}`}
                    style={{
                        width: `6px`,
                        height: `6px`,
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={styles.loader}
            style={
                {
                    "--size": `${size}px`,
                    "--color": color ?? "#000000ab",
                } as CSSProperties
            }
        />
    );
}
