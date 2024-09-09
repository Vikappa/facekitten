'use client'

import { useAppSelector } from "../lib/hooks"
import PostCardComponent from "./PostCardComponent"

const UserProfilePostRenderer = () => {
    const posts = useAppSelector(state => state.posts.userPosts)

    return(
        <div className="container w-100" >

    <div className="d-flex flex-column align-items-center justify-content-center w-100 p-2 bg-grayBg col-9">
        {posts.map((post, index) => (
            <PostCardComponent key={"userPost"+index} post={post} />
        ))}
    </div>
        </div>
    )
}

export default UserProfilePostRenderer