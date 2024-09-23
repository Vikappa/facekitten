'use client'
import { useMemo } from "react"
import { useAppSelector } from "../lib/hooks"
import { Post } from "../utils/StorageDataTypes"
import PostCardComponent from "../components/PostCardComponent"
import MarketplaceSidebarheader from "../atoms/MarketplaceSidebarheader"
import MarketplaceSideSearchBar from "../atoms/MarketplaceSideSearchBar"
import MarketplacePostCard from "../components/MarketplacePostCard"

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
    <div className="container-fluid h-100"
    style={{
      minHeight: '100vh'
    }}
    >
        <div className="row h-100">
        <div className="col-0 col-sm-2 bg-white shadow h-100 min-vh-sm-100" 
        >
          <MarketplaceSidebarheader/>
          <MarketplaceSideSearchBar/>
      </div>
      <div className="col-12 col-sm-9 d-flex flex-wrap py-3">
        {allMarketPlacePosts.map((marketplacePost) => (
          <MarketplacePostCard 
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
