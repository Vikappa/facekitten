"use client";

import { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";

interface NavBarSearchPillProps {
    size?: number;
    className?: string;
    isOpen: boolean;
    setIsOpen: (value: boolean) => void
}

export function NavBarSearchPill({
    size = 40,
    className = "",
    isOpen,
    setIsOpen
}: NavBarSearchPillProps) {


    const wrapperRef = useRef<HTMLDivElement>(null);

    // Chiude quando clicchi fuori
    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div
            ref={wrapperRef}
            onClick={() => setIsOpen(true)}   // apre sempre, chiude solo col click-outside
            className={`
            flex items-center gap-2
            rounded-full bg-gray-100
            px-3 cursor-pointer
            ${className}
            ${isOpen ? "flex-1 min-w-0" : "flex-none w-auto"}
        `}
            style={{
                height: `${size}px`,
                minHeight: `${size}px`,
            }}
        >
            {isOpen ? (
                <input
                    placeholder="Cerca micetti..."
                    className="w-full bg-transparent outline-none border-none text-sm text-gray-600 whitespace-nowrap overflow-ellipsis"
                />
            ) : (
                <FiSearch
                    className="text-gray-500"
                    size={size * 0.5}
                />
            )}
        </div>
    );

}
