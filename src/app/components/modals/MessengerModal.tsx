'use client'

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setActiveNavFunction } from "@/lib/redux/uiSlice";
import { usePathname } from "next/navigation";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import ChatMessageModalLi from "../atoms/ChatMessageModalLi";

interface MessengerModalProps {
    navbarRef: MutableRefObject<HTMLDivElement | null>;
}
const MIN_MODAL_RIGHT_MARGIN_PX = 8;

export default function MessengerModal({ navbarRef }: MessengerModalProps) {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const previousPathnameRef = useRef(pathname);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const isOpen = useAppSelector((state) => state.ui.activeNavFunction === "messenger");
    const [navbarHeight, setNavbarHeight] = useState(0);
    const [rightOffset, setRightOffset] = useState(MIN_MODAL_RIGHT_MARGIN_PX);
    const chatMessages = useAppSelector((state) => state.profile.chats);
    const [isUpdating, setIsUpdating] = useState(false);
    
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
    
        useEffect(() => {
            if (!isOpen) {
                return;
            }
    
            const navbarElement = navbarRef.current;
            const bellButton = document.querySelector('button[aria-label="Notifications"]') as HTMLButtonElement | null;
    
            const updateModalPosition = () => {
                const currentNavbarHeight = navbarElement?.getBoundingClientRect().height ?? 0;
                setNavbarHeight(currentNavbarHeight);
    
                if (!bellButton) {
                    setRightOffset(MIN_MODAL_RIGHT_MARGIN_PX);
                    return;
                }
    
                const bellIcon = bellButton.querySelector("svg");
                const anchorRect = bellIcon?.getBoundingClientRect() ?? bellButton.getBoundingClientRect();
                const anchorX = anchorRect.left + anchorRect.width / 2;
    
                setRightOffset(
                    Math.max(
                        MIN_MODAL_RIGHT_MARGIN_PX,
                        Math.round(window.innerWidth - anchorX)
                    )
                );
            };
    
            updateModalPosition();
    
            const resizeObserver = navbarElement ? new ResizeObserver(updateModalPosition) : null;
            if (navbarElement && resizeObserver) {
                resizeObserver.observe(navbarElement);
            }
            window.addEventListener("resize", updateModalPosition);
    
            return () => {
                resizeObserver?.disconnect();
                window.removeEventListener("resize", updateModalPosition);
            };
        }, [isOpen, navbarRef]);
    

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
            {chatMessages.map((chatThread) => (
                    <ChatMessageModalLi key={chatThread.withProfile.id} chatThread={chatThread} />
                )
            )}
            <div className="d-flex text-sm font-bold text-center text-blue-600">
                Apri tutti i messaggi
            </div>
        </div>
        )
}
