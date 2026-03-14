'use client'

import { PostData } from "@/lib/interfaces/CommonInterfaces"
import Image from "next/image"

interface PostCardProp {
    data:PostData
}

export default function PostCard(prop: PostCardProp) {
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
                <p className="text-center text-primary font-semibold">{prop.data.authorName}</p>
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
