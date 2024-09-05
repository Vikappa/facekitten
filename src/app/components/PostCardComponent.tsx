'use client'
import { useEffect, useState } from "react"
import PostBody from "../atoms/PostBody"
import PostComments from "./PostComments"
import PostHeader from "../atoms/PostHeader"
import { FakePostFactory } from "../utils/FakePostFactory/FakePostFactory"
import { Post } from "../utils/StorageDataTypes"
import PostReactionSection from "./PostReactionSection"

const PostCardComponent = () => {

    const [post, setPost]= useState<Post>()

    useEffect(() => {
        async function fetchPost() {
            const newPost = await FakePostFactory()
            setPost(newPost)
        }
        fetchPost()
    }, [])
    

    return(
    <div className="
        bg-white p-3 m-2 rounded-3 shadow-sm 
        ">
        <PostHeader user={post?.author} time={post?.created_at}/>
        <PostBody bodyPost={post?.body} postImage={post?.image} />
        <PostReactionSection/>
        <PostComments comments={post?.comments}/>
    </div>
)
}

export default PostCardComponent