'use client'

import { CommentData } from "@/lib/interfaces/CommonInterfaces"
import CommentLi from "./CommentLi"

interface CommentListProps{
    commentData:CommentData[]
}

export default function CommentList({commentData}:CommentListProps){


    return (
        <div className="flex w-full flex-col mt-2">
            {
                commentData.map((c, index) => (
                    <CommentLi comment={c} key={index} />
                ))
            }
        </div>
    )
}