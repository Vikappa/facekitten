'use client'
import { Post } from "@/lib/Classes/Posts/PostsClasses";

interface PostCardProps{
    post: Post
}
export async function PostCard({post} : PostCardProps) {
    
    return (
        <div>
            <span className="bold">
                {post.author ? post.author?.username : "Nessun autore"}
            </span>
            <span>
                {post.content}
            </span>
        </div>
    )
}