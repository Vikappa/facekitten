'use client'

import Image from "next/image"
import { Post } from "../utils/StorageDataTypes"
import ProfileImageResponsiveComponent from "../atoms/ProfileImageResponsiveComponent"
import PostCardComponent from "../components/PostCardComponent"

const SinglePostPageOrg = ({post}:{post:Post}) => {
    return (
        <div>
            <div className="d-flex flex-column align-items-center justify-content-start mb-3 shadow"
                style={{minHeight: '50vh', background: 'linear-gradient(to top, white 40%, grey 80%)'
                }}
            >
                <div className="col-sm-9">
                    <Image src={post.author.coverPhotoUrl} alt="Cover Photo" className="w-100 rounded-bottom-3" width={400} height={280}/>
                    <ProfileImageResponsiveComponent profilePicture={post.author.profilepicture} userName={post.author.userName}/>
                </div>
            </div>
            <div className="align-align-items-center justify-content-center mx-auto col-sm-8 p-2 px-sm-0">
                <PostCardComponent post={post} />
            </div>
        </div>
    )
}

export default SinglePostPageOrg