'use client'

import NavBar from "@/app/components/NavBar"
import { useAppSelector } from "@/app/lib/hooks"
import MobileOptionFullScreenModal from "@/app/modali/MobileOptionFullScreenModal"
import ModaleNotificationMobileModale from "@/app/modali/ModaleNotificationMobileModale"
import SinglePostPageOrg from "@/app/organisms/SinglePostPageOrg"
import { useParams } from "next/navigation"
import '@/app/style.css'
const UserBotPostPage = () => {
    
    const {author, postid} = useParams()
    const post = useAppSelector(state => state.sessionGeneratedAccounts.acc.flatMap(acc => acc.posts).find(post => post.id === Number(postid)))
    const posts = useAppSelector(state => state.sessionGeneratedAccounts.acc)
    if(!post){
        console.log(postid)
        console.log(posts)
        return null
    }
    return (
        <div>
            <ModaleNotificationMobileModale />
            <MobileOptionFullScreenModal />
            <NavBar/>
            <SinglePostPageOrg post={post}/>
        </div>
    )
}

export default UserBotPostPage