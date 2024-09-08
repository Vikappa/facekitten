import { Dispatch } from "@reduxjs/toolkit";
import PostCommentForm from "../atoms/PostCommentForm"
import PostCommentsList from "../atoms/PostCommentsList"
import { Post } from "../utils/StorageDataTypes"
import { SetStateAction } from "react";

const PostComments = (
    {post,showCommentSection}:
    {post:Post|undefined; showCommentSection:boolean; }
) => {

    if(showCommentSection && post){
        return(
            <div className="p-2">
                <PostCommentForm post={post}/>
                <PostCommentsList post={post}/>
            </div>
        )
    }
}

export default PostComments