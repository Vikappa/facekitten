'use client'

import { PostData } from "@/lib/interfaces/CommonInterfaces"
import { useAppSelector } from "@/lib/redux/hooks"
import Image from "next/image"
import Link from "next/link"

interface PostCardProp {
    data:PostData
}

export default function PostCard(prop: PostCardProp) {

    const userId = useAppSelector((state) => state.profile.currentProfile?.id)

    return (
        <div className="flex flex-col shadow-sm bg-white m-2 rounded-md p-2 mb-0">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                    <Image
                        src={prop.data.imageUrl ?? "/assets/blankprofile.png"}
                        alt={prop.data.authorName ?? ""}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                    />
                </div>
                <Link className="text-center text-black font-semibold" href={prop.data.authorId === userId ? `/profile/` : `/profile/${prop.data.authorId}`}>{prop.data.authorName}</Link>
            </div>
            <div className="p-2">
                <p>{prop.data.text}</p>
            </div>
            <div className="flex w-full text-gray-900 text-sm">
                <span>Mi piace</span>
                <span className="mx-auto">Commenta</span>
                <span>Condividi</span>
            </div>
        </div>
    )
}
