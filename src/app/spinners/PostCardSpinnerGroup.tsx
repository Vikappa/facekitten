'use client'

import PostCardSpinner from "./PostCardSpinner"

const PostCardSpinnerGroup = () => {
    return(
    <div className="d-flex flex-column gap-3 m-0 p-0 w-100">
        <PostCardSpinner/>
        <PostCardSpinner/>
        <PostCardSpinner/>
        <PostCardSpinner/>
        <PostCardSpinner/>
        <PostCardSpinner/>
        <PostCardSpinner/>
    </div>
    )
}

export default PostCardSpinnerGroup