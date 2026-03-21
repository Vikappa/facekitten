'use client'

import { useAppSelector } from "@/lib/redux/hooks";
import { MutableRefObject, useEffect, useState } from "react";
import NotificationModalLi from "../cells/NotificationModalParts/NotificationLi";

interface NotificationModalProps {
    navbarRef: MutableRefObject<HTMLDivElement | null>;
}

const MIN_MODAL_RIGHT_MARGIN_PX = 8;

export default function NotificationModal({ navbarRef }: NotificationModalProps){
    const isOpen = useAppSelector((state) => state.ui.activeNavFunction === "bell");
    const notificationSlice = useAppSelector((state) => state.notifications.unreadNotifications);
    const [navbarHeight, setNavbarHeight] = useState(0);
    const [rightOffset, setRightOffset] = useState(MIN_MODAL_RIGHT_MARGIN_PX);

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

    if (!isOpen) {
        return null;
    }

    return (
        <div
            style={{ top: `${navbarHeight}px`, right: `${rightOffset}px` }}
            className="fixed z-50 mt-2 flex max-h-[70vh] w-60 max-w-[calc(100vw-1rem)] flex-col gap-2 overflow-y-auto rounded-xl bg-white p-3 shadow-lg"
        >
            {
                notificationSlice.length > 0 ? notificationSlice.map((notification) =>
                    <NotificationModalLi key={notification.id} notification={notification} />
                )
                :
                    <p className="text-sm text-gray-500 italic">Non ci sono notifiche</p>
            }
        </div>
    )
}
