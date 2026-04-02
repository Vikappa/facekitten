'use client'

import { PostData } from "@/lib/interfaces/CommonInterfaces"
import PostCard from "../PostCard"
import { useEffect, useState } from "react"

interface PostlistProp{
    posts: PostData[]
}

export default function PostList(props:PostlistProp){
    const [nowMs, setNowMs] = useState(() => Date.now());

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setNowMs(Date.now());
        }, 15_000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="flex flex-col">
            {
                props.posts.map(p => {
                    return <PostCard key={p.postId} data={p} nowMs={nowMs}/>
                })
            }
        </div>
    )
}
