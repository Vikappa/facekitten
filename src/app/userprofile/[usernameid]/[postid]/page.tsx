'use client'

import { useAppSelector } from "@/app/lib/hooks"
import MobileOptionFullScreenModal from "@/app/modali/MobileOptionFullScreenModal"
import ModaleNotificationMobileModale from "@/app/modali/ModaleNotificationMobileModale"
import SinglePostPageOrg from "@/app/organisms/SinglePostPageOrg"
import { useParams } from "next/navigation"

const UserBotPostPage = () => {

    const {author, postid} = useParams()
    const post = useAppSelector(state => state.sessionGeneratedAccounts.acc.find(account => account.name === author)?.posts.find(post => post.id === Number(postid)))

    if(!post){
        return null
    }
    return (
        <div>
            <ModaleNotificationMobileModale />
            <MobileOptionFullScreenModal />
            <SinglePostPageOrg post={post}/>
        </div>
    )
}

export default UserBotPostPage