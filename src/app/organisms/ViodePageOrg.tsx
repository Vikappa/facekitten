'use client'

import { useMemo } from "react"
import { useAppSelector } from "../lib/hooks"
import { Post } from "../utils/StorageDataTypes"
import ReelCard from "../components/ReelCard"

const VideoPageOrg = () =>{
    const allPosts = useAppSelector(state => state.sessionGeneratedAccounts.acc.flatMap(user => user.posts))
    const userPosts = useAppSelector(state => state.posts.userPosts)
    const reels = useMemo(() => {
        const returnArray: Post[] = []
        allPosts.forEach(post => {
            if(post.body !== undefined && typeof post.body === 'object' && 'videoText' in post.body){
                returnArray.push(post)
            }
        })
        userPosts.forEach(post => {
            if(post.body !== undefined && typeof post.body === 'object' && 'videoText' in post.body){
                returnArray.push(post)
            }
        })
        return returnArray
    }, [allPosts,userPosts])

    return(
        <div className="row">
            <div className="col-2">

            </div>

            <div className="col-8 d-flex flex-column align-items-center">
                {
                    reels.map(reel => (
                        <ReelCard key={reel.id} reel={reel} />
                    ))
                }
            </div>

            <div className="col-2">

            </div>
        </div>
    )
}

export default VideoPageOrg