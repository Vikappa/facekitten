'use client'

import { PostData } from "@/lib/interfaces/CommonInterfaces"
import PostCard from "./PostCard"

interface PostlistProp{
    posts: PostData[]
}

export default function PostList(props:PostlistProp){
    return (
        <div className="flex flex-col">
            {
                props.posts.map(p => {
                    return <PostCard key={p.postId} data={p}/>
                })
            }
        </div>
    )
}
