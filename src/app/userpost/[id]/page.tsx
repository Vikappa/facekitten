'use client'

import NavBar from "@/app/components/NavBar"
import { useAppSelector } from "@/app/lib/hooks"
import SinglePostPageOrg from "@/app/organisms/SinglePostPageOrg"
import { useParams } from "next/navigation"
import '@/app/style.css'



const UserPostPage = () => {
    const id = useParams()
    const post = useAppSelector(state => state.posts.userPosts.find(post => post.id === Number(id.id)))

    
    if(!post){
        return null
    }   
    return(
        <>
        <NavBar/>
        <SinglePostPageOrg post={post}/>
        </>
    )
}

export default UserPostPage