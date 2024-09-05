'use client'
import { useEffect, useState } from "react"
import { Post, PostComment } from "../utils/StorageDataTypes"
import PostCommentLi from "./PostCommentLi"

const PostCommentsList = ({post}: {post: Post|undefined}) => {

    const [comments, setComments] = useState<PostComment[]>()
    useEffect(() => {
        setComments(post?.comments)

    }, [post])
    

    return(
    <div
    className="
    d-flex flex-column-reverse"
    >
        {comments?.map((comment) => (
            <PostCommentLi comment={comment} key={comment.id}/>
    ))}
    </div>
)
}

export default PostCommentsList