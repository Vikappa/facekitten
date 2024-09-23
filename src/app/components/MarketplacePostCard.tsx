'use client'

import Image from "next/image"
import { Post } from "../utils/StorageDataTypes"

const MarketplacePostCard = ({post}:{post: Post}) => {

    if(!post.body) return null
    if(typeof post.body === "object" && 'marketplacePhotoUrl' in post.body){
        return(
            <div className="card mb-3 col-2 p-2 bg-transparent border-0">
                <Image src={post.body.marketplacePhotoUrl} alt="Marketplace Post Image" className="card-img-top" width={200} height={200} />
                <p>{post.body.marketPlaceText.slice(0,50)}..</p>
            </div>
        )
    }
}

export default MarketplacePostCard