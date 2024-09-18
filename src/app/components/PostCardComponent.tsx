'use client'
import { useEffect, useState } from "react"
import PostBody from "../atoms/PostBody"
import PostComments from "./PostComments"
import PostHeader from "../atoms/PostHeader"
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
        bg-white p-3 rounded-3 shadow-sm w-100 position-relative
        ">
        <PostHeader user={post?.author} time={post?.created_at}/>
        {
            post.body !== undefined && typeof post.body === 'object' && 'normalPostTex' in post.body ? (
                <PostBody bodyPost={post?.body} postImage={''} post={post} />
            ) : 
            post.body !== undefined && typeof post.body === 'object' && 'imagePostText' in post.body ? (
                <PostBody bodyPost={post?.body} postImage={post.body.imageUrl} post={post} />
            ) : 
            post.body !== undefined && typeof post.body === 'object' && 'marketPlaceText' in post.body ? (
                <PostBody bodyPost={post?.body} postImage={post.body.marketplacePhotoUrl} post={post} />
            ) : 
            post.body !== undefined && typeof post.body === 'object' && 'videoText' in post.body ? (
                <PostBody bodyPost={post?.body} postImage={post.body.videoUrl} post={post} />
            ) : 
            post.body !== undefined && typeof post.body === 'object' && 'rewtweetText' in post.body ? (
                <PostBody bodyPost={post?.body} postImage={''} post={post} />
            ) : 
            
            ''
        }
        <PostReactionSection setShowCommentSection={setShowCommentSection} post={post} />
        <PostComments showCommentSection={handleShowCommentSection()}  post={post}/>

    </div>
)
}
export default PostCardComponent