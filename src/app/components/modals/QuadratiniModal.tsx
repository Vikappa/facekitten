'use client'

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setActiveNavFunction } from "@/lib/redux/uiSlice";
import { usePathname } from "next/navigation";
import { MutableRefObject, useEffect, useRef } from "react";

interface QuadratiniModalProps {
    navbarRef: MutableRefObject<HTMLDivElement | null>;
}

export default function QuadratiniModal({ navbarRef }: QuadratiniModalProps){
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const previousPathnameRef = useRef(pathname);
    const modalRef = useRef<HTMLDivElement | null>(null);

    const isOpen = useAppSelector((state) => state.ui.activeNavFunction === "squares");

    useEffect(() => {
        const previousPathname = previousPathnameRef.current;
        previousPathnameRef.current = pathname;

        if (!isOpen) {
            return;
        }

        if (previousPathname !== pathname) {
            dispatch(setActiveNavFunction(null));
        }
    }, [pathname, isOpen, dispatch]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) {
                return;
            }

            const clickedInsideModal = modalRef.current?.contains(target) ?? false;
            const clickedInsideNavbar = navbarRef.current?.contains(target) ?? false;

            if (clickedInsideModal || clickedInsideNavbar) {
                return;
            }

            dispatch(setActiveNavFunction(null));
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
        };
    }, [isOpen, dispatch, navbarRef]);

    if (!isOpen) {
        return null;
    }

    return (
        <div ref={modalRef}>QUADRATINI</div>
    )
}
