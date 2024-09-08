'use client'
import { useEffect, useState } from "react"
import PostBody from "../atoms/PostBody"
import PostComments from "./PostComments"
import PostHeader from "../atoms/PostHeader"
import { FakePostFactory } from "../utils/FakePostFactory/FakePostFactory"
import { Post } from "../utils/StorageDataTypes"
import PostReactionSection from "./PostReactionSection"

const PostCardComponent = ({post}:{post:Post}) => {

    const [showCommentSection, setShowCommentSection] = useState<boolean>(false)

    const handleShowCommentSection = () =>  {
        if(showCommentSection || (post.comments.length > 0)){
            return true
        } else {
            return false
        }
    }

    return(
    <div className="
        bg-white p-3 rounded-3 shadow-sm w-100
        ">
        <PostHeader user={post?.author} time={post?.created_at}/>
        <PostBody bodyPost={post?.body} postImage={post?.image} />
        <PostReactionSection setShowCommentSection={setShowCommentSection} />
        <PostComments showCommentSection={handleShowCommentSection()}  post={post}/>
    </div>
)
}

export default PostCardComponent