'use client'
import Image from "next/image"
import { Form } from "react-bootstrap"
import { useAppDispatch, useAppSelector } from "../lib/hooks"
import { useState } from "react"
import { FiSend } from "react-icons/fi";
import { Post } from "../utils/StorageDataTypes"
import { addCommentToPost } from "../lib/slices/sessionGeneratedAccountsSlice"
import { profile } from "console"

const PostCommentForm = ({post}: {post: Post|undefined}) => {
    const [commentValue, setCommentValue] = useState<string>() 
    const userDetails = useAppSelector((state) => state.userCredentials)
    const dispatch = useAppDispatch()

    const sendComment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(commentValue)
        if(post && commentValue){
            dispatch(addCommentToPost({
                post,
                commentValue,
                author: {
                    userName: userDetails.userName,
                    profilepicture: userDetails.profilepictureUrl
                }
            }))
        }
    }

    return(
    <Form className="d-flex align-items-center gap-2" onSubmit={sendComment}>
        <Image src={userDetails.profilepictureUrl} alt={userDetails.userName} height={35} width={35}
        className="rounded-circle"
        />
        <Form.Group className="w-100">
            <Form.Control 
            type="text" placeholder={`Commenta come ${userDetails.userName}`} 
            value={commentValue} onChange={(e)=> setCommentValue(e.target.value)}
            className="border-0 bg-grayBg
            p-2 px-3 rounded-pill
            "
            />
        </Form.Group>
        <button className="bg-transparent border-0">
        <FiSend />
        </button>
        
    </Form>)
}

export default PostCommentForm