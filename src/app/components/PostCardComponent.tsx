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

    return(
    <div className="
        bg-white p-3 my-2 m-sm-2 rounded-3 shadow-sm 
        ">
        <PostHeader user={post?.author} time={post?.created_at}/>
        <PostBody bodyPost={post?.body} postImage={post?.image} />
        <PostReactionSection setShowCommentSection={setShowCommentSection} />
        <PostComments showCommentSection={showCommentSection}  post={post}/>
    </div>
)
}

export default PostCardComponent