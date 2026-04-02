'use client'

import { PostData } from "@/lib/interfaces/CommonInterfaces";
import Image from "next/image";
import Link from "next/link";

interface SubPostCardProps {
    subPostData: PostData | null;
}

export default function SubPostCard({ subPostData }: SubPostCardProps) {
    if (!subPostData) {
        return (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
                Post non disponibile.
            </div>
        );
    }

    const normalizedText = subPostData.text.trim();
    const mediaUrl = (subPostData.postMediaUrl ?? subPostData.postImageUrl ?? "").trim();

    let formattedDate = subPostData.postedAt;
    const parsedDate = new Date(subPostData.postedAt);
    if (!Number.isNaN(parsedDate.getTime())) {
        formattedDate = new Intl.DateTimeFormat("it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(parsedDate);
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
            <Link href={`/post/${subPostData.postId}`} className="flex items-center gap-2">
                <div className="h-8 w-8 overflow-hidden rounded-full">
                    <Image
                        src={
                            subPostData.imageUrl && subPostData.imageUrl.length > 0
                                ? subPostData.imageUrl
                                : "/assets/blankprofile.png"
                        }
                        alt={subPostData.authorName}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-gray-900">
                        {subPostData.authorName}
                    </span>
                    <span className="text-[11px] text-gray-400">{formattedDate}</span>
                </div>
            </Link>
            {normalizedText.length > 0 && (
                <p className="mt-2 text-sm text-gray-800">{normalizedText}</p>
            )}
            {mediaUrl.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-md">
                    <Image
                        src={mediaUrl}
                        alt="Media del post condiviso"
                        width={720}
                        height={420}
                        className="h-auto w-full object-cover"
                    />
                </div>
            )}
        </div>
    )
}
