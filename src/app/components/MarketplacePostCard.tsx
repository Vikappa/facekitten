'use client'

import Image from "next/image"
import { Post } from "../utils/StorageDataTypes"
import Link from "next/link"

const MarketplacePostCard = ({post}:{post: Post}) => {

    if(!post.body) return null
    if(typeof post.body === "object" && 'marketplacePhotoUrl' in post.body){
        return(
            <div className="card mb-3 col-6 col-md-4 col-lg-3 col-xl-2 p-1 bg-transparent border-0 d-flex flex-column">
                <Image src={post.body.marketplacePhotoUrl} alt="Marketplace Post Image" className="card-img-top rounded-3" width={200} height={200} />
                <div className="p-1">
                    <Link href={`/userprofile/${post.author.userName}/${post.id}`} className="text-decoration-none text-black underline-hover">
                    <p className="p-0 m-0 fs-5 fw-semibold">{post.body.marketplacePrice}</p>
                    <p className="p-0 m-0 fs-5 fw-semibold">{post.body.marketplaceTitle}</p>
                    </Link>
                    <p
                    style={{
                        color: 'grey',
                        fontSize: '0.9rem',
                    }}>{post.body.marketPlaceText.slice(0,50)}..</p>
                </div>

            </div>
        )
    }
}

export default MarketplacePostCard