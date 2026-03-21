'use client'

import { NotificationData } from "@/lib/interfaces/CommonInterfaces"
import Image from "next/image";
import Link from "next/link";

interface NotificationModalLiProps {
    notification: NotificationData
}

export default function NotificationModalLi(props: NotificationModalLiProps) {
    const activityFromName = props.notification.activityFrom.name.trim() || "Utente";
    const activityFromAvatar = props.notification.activityFrom.avatarUrl?.trim() || "/assets/blankprofile.png";
    const previewText = props.notification.previewText?.trim() ?? "";

    return (
            <Link className="flex w-full items-start gap-2 rounded-lg p-2 hover:bg-gray-100" href={props.notification.generatedNavigation ?? ""}>
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
