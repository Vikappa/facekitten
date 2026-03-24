"use client";

import { MutableRefObject, useRef } from "react";
import ProfileModal from "../modals/ProfileModal";
import Navbar from "./Navbar";
import NotificationModal from "../modals/NotificationModal";
import MessengerModal from "../modals/MessengerModal";
import GlobalNotificationsPolling from "./GlobalNotificationsPolling";

export enum PageFocus {
    Home,
    Profile,
    Messages,
    Notifications,
    Settings,
    Search
}

export default function CommonLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const navbarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

    return (
        <div>
        <GlobalNotificationsPolling />
        <Navbar navbarRef={navbarRef} />
        <ProfileModal navbarRef={navbarRef} />
        <MessengerModal />
        <NotificationModal navbarRef={navbarRef} />
                {children}
        </div>
    );
}
