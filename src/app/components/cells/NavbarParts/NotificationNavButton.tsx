'use client'

import { FaBell } from "react-icons/fa";

interface NotificationNavButtonProps {
    onClick: (nextState: boolean) => void;
    isActive: boolean;
    className: string;
    unreadCount: number;
}

export default function NotificationNavButton(props: NotificationNavButtonProps) {
    const handleClick = () => {
        props.onClick(!props.isActive);
    };

    const normalizedUnreadCount = Math.max(0, props.unreadCount);
    const badgeText = normalizedUnreadCount > 99 ? "99+" : String(normalizedUnreadCount);

    return (
        <button
            onClick={handleClick}
            aria-label="Notifications"
            className={`${props.className} relative ${props.isActive ? "text-primary bg-secondary" : ""} transition-[color,background-color] duration-300 ease-in`}
        >
            <FaBell className="text-2xl" />
            {
                normalizedUnreadCount > 0 && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
                        {badgeText}
                    </span>
                )
            }
        </button>
    );
}
