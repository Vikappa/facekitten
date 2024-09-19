'use client'
import { useMemo } from "react"
import { useAppSelector } from "../lib/hooks"
import { Post } from "../utils/StorageDataTypes"
import PostCardComponent from "../components/PostCardComponent"

const MarketplaceContent = () => {
  const botsMarketPlacePosts = useAppSelector(state => state.sessionGeneratedAccounts.acc.flatMap(account => account.posts))
  const userPosts = useAppSelector(state => state.posts.userPosts)

  const allMarketPlacePosts = useMemo(() => {
    return [
      ...botsMarketPlacePosts.filter(post => post.body && typeof post.body === "object" && 'marketplacePhotoUrl' in post.body),
      ...userPosts.filter(post => post.body && typeof post.body === "object" && 'marketplacePhotoUrl' in post.body)
    ]
  }, [botsMarketPlacePosts, userPosts])

  return (
    <div className="container">
        <div className="row">
        <div className="col-0 col-sm-3" >
      </div>
      <div className="col-12 col-sm-9">
        {allMarketPlacePosts.map((marketplacePost) => (
          <PostCardComponent 
            key={`${marketplacePost.id}${marketplacePost.author.userName}${Date.now()}`} 
            post={marketplacePost} 
          />
        ))}
      </div>
        </div>
    </div>
  )
}

export default MarketplaceContent
