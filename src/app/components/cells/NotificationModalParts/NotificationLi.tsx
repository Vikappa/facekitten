'use client'

import { NotificationData } from "@/lib/interfaces/CommonInterfaces"
import { useAppDispatch } from "@/lib/redux/hooks";
import { removeUnreadNotificationById } from "@/lib/redux/notificationsSlice";
import { setActiveNavFunction } from "@/lib/redux/uiSlice";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEvent, useState } from "react";

interface NotificationModalLiProps {
    notification: NotificationData
}

export default function NotificationModalLi(props: NotificationModalLiProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const activityFromName = props.notification.activityFrom.name.trim() || "Utente";
    const activityFromAvatar = props.notification.activityFrom.avatarUrl?.trim() || "/assets/blankprofile.png";
    const previewText = props.notification.previewText?.trim() ?? "";
    const generatedNavigation = props.notification.generatedNavigation?.trim() ?? "";

    async function markNotificationAsSeen(notificationId: string) {
        const response = await fetch("/api/v1/notifications/mark-seen", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ notificationId }),
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(
                typeof payload?.error === "string"
                    ? payload.error
                    : "Impossibile marcare la notifica come vista"
            );
        }
    }

    async function handleClickNotification(event: MouseEvent<HTMLAnchorElement>) {
        event.preventDefault();
        if (isNavigating) {
            return;
        }

        setIsNavigating(true);
        try {
            await markNotificationAsSeen(props.notification.id);
            dispatch(removeUnreadNotificationById(props.notification.id));
            dispatch(setActiveNavFunction(null));

            if (generatedNavigation.length > 0) {
                router.push(generatedNavigation);
            }
        } catch (error) {
            console.error("Errore apertura notifica:", error);
        } finally {
            setIsNavigating(false);
        }
    }

    return (
            <Link
                className="flex w-full items-start gap-2 rounded-lg p-2 hover:bg-gray-100"
                href={generatedNavigation.length > 0 ? generatedNavigation : "#"}
                onClick={handleClickNotification}
                aria-disabled={isNavigating}
            >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                    <Image
                        src={activityFromAvatar}
                        alt={activityFromName}
                        fill
                        sizes="36px"
                        className="object-cover"
                    />
                </div>
                <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-gray-900">
                        {activityFromName}
                    </span>
                    {
                        previewText.length > 0 &&
                        <span className="line-clamp-2 text-xs text-gray-600">
                            {previewText}
                        </span>
                    }
                </div>
            </Link>
    )
}
