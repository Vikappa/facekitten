'use client'
import Image from "next/image"
import { useAppSelector } from "../lib/hooks"
import ProfileImageResponsiveComponent from "../atoms/ProfileImageResponsiveComponent"
import UserProfilePostRenderer from "../components/UserProfilePostRenderer"
import CreateFormPost from "../components/CreatePostForm"
import { CasualUser } from "../utils/StorageDataTypes"
import PostCardComponent from "../components/PostCardComponent"

const BotProfileRenderer = ({user}:{user:CasualUser}) => {
    const botPosts = useAppSelector( state => state.sessionGeneratedAccounts.acc.find(account => account.name === user.name)?.posts)

    if(user && botPosts){
        return(
            <div>
                <div 
                className="d-flex flex-column align-items-center justify-content-start mb-3 shadow"
                style={{minHeight: '50vh', background: 'linear-gradient(to top, white 40%, grey 80%)'
                }}
                >
                    <div className="col-sm-9">
                    <Image src={user.coverPhotoUrl} alt="Cover Photo" className="w-100 rounded-bottom-3" width={400} height={280}/> 
                    <ProfileImageResponsiveComponent profilePicture={user.profilePic} userName={user.name}/>
                    </div>
                    
                </div>
                <div className="align-align-items-center justify-content-center mx-auto col-sm-8 p-2 px-sm-0">
                {user.posts.map((post, index) => (
                <PostCardComponent key={post.author.userName.replace(' ','')+index}  post={post} />
            ))}
                </div>
            </div>
        )
    } else {
        return null
    }
}

export default BotProfileRenderer