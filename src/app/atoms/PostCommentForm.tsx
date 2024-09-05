'use client'
import Image from "next/image"
import { Form } from "react-bootstrap"
import { useAppSelector } from "../lib/hooks"
import { useState } from "react"
import { FiSend } from "react-icons/fi";

const PostCommentForm = () => {
    const [commentValue, setCommentValue] = useState<string>() 
    const userDetails = useAppSelector((state) => state.userCredentials)
    return(
    <Form className="d-flex align-items-center gap-2">
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