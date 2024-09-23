'use client'
import Image from "next/image"
import { PostComment } from "../utils/StorageDataTypes"
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import Link from "next/link";

const PostCommentLi = ({comment}: {comment: PostComment}) => {

    return(
    <div className="d-flex align-items-center gap-2 pt-2 position-relative">
        <Image src={comment.author.profilepicture} alt={comment.author.userName} width={34} height={34} className="rounded-circle" />
        <div className="d-flex flex-column rounded-4 p-1 px-2 bg-grayBg ">
        <Link href={`/userprofile/${comment.author.userName}`} className="text-decoration-none text-dark fw-bold">
        <p className="m-0 px-1 ">
            {comment.author.userName}
        </p>
        </Link>
        <p className="m-0 px-1">
            {comment.body}
        </p>

        </div>
        <HiOutlineDotsHorizontal />
    </div>
    )
}

export default PostCommentLi