'use client'

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setActiveNavFunction } from "@/lib/redux/uiSlice";
import { usePathname } from "next/navigation";
import { MutableRefObject, useEffect, useRef, useState } from "react";

interface QuadratiniModalProps {
    navbarRef: MutableRefObject<HTMLDivElement | null>;
}
const MIN_MODAL_RIGHT_MARGIN_PX = 8;

export default function QuadratiniModal({ navbarRef }: QuadratiniModalProps){
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const previousPathnameRef = useRef(pathname);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const [navbarHeight, setNavbarHeight] = useState(0);
    const [rightOffset, setRightOffset] = useState(MIN_MODAL_RIGHT_MARGIN_PX);

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
        <div
            ref={modalRef}
            style={{ top: `${navbarHeight}px`, right: `${rightOffset}px` }}
            className="fixed z-50 mt-2 flex max-h-[70vh] w-60 max-w-[calc(100vw-1rem)] flex-col gap-2 overflow-y-auto rounded-xl bg-white p-3 shadow-lg"
        >
            NON IMPLEMENTATO
        </div>    )
}
