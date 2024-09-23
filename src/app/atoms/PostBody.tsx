import Image from "next/image";
import { ImagePostBody, MarketPlacePostString, NormalPostBody, Post, Retweetpostbody, VideoPostBody } from "../utils/StorageDataTypes";

const PostBody = (
    {bodyPost, postImage, post}:
    {bodyPost:NormalPostBody | MarketPlacePostString | ImagePostBody | VideoPostBody | Retweetpostbody | undefined
         postImage:string|undefined; 
         post:Post}) => {
    if(bodyPost !== undefined && typeof bodyPost === 'object' && 'normalPostTex' in bodyPost){
        return(
            <div className="p-1 py-3 position-relative">
            {postImage && <Image src={postImage} alt="Post image" width={200} height={200} className="w-100 h-auto p-3" onClick={() => {console.log('open image ', postImage)}}/>}
            <p>{bodyPost.normalPostTex}</p>
            <div className="position-absolute d-flex gap-2" style={{right:'0', bottom:'-1rem', fontSize:'0.8rem'}}>
            {post.likes>0 && <p>{post.likes} mi piace</p>}
            {post.comments.length>0 && <p>{post.comments.length} comment{post.comments.length === 1 ? 'o':'i'}</p>}
        </div>
        </div>
    )
    }
    if(bodyPost !== undefined && typeof bodyPost === 'object' && 'marketPlaceText' in bodyPost){
        return(
            <div className="p-1 py-3 position-relative">
            {postImage && <Image src={postImage} alt="Post image" width={200} height={200} className="w-100 h-auto p-3" onClick={() => {console.log('open image ', postImage)}}/>}
            <p>{bodyPost.marketPlaceText}</p>
            <div className="position-absolute d-flex gap-2" style={{right:'0', bottom:'-1rem', fontSize:'0.8rem'}}>
            {post.likes>0 && <p>{post.likes} mi piace</p>}
            {post.comments.length>0 && <p>{post.comments.length} comment{post.comments.length === 1 ? 'o':'i'}</p>}
        </div>
        </div>
    )
    }
    if(bodyPost !== undefined && typeof bodyPost === 'object' && 'imagePostText' in bodyPost){
        return(
            <div className="p-1 py-3 position-relative">
            {postImage && <Image src={postImage} alt="Post image" width={200} height={200} className="w-100 h-auto p-3" onClick={() => {console.log('open image ', postImage)}}/>}
            <p>{bodyPost.imagePostText}</p>
            <div className="position-absolute d-flex gap-2" style={{right:'0', bottom:'-1rem', fontSize:'0.8rem'}}>
            {post.likes>0 && <p>{post.likes} mi piace</p>}
            {post.comments.length>0 && <p>{post.comments.length} comment{post.comments.length === 1 ? 'o':'i'}</p>}
        </div>
        </div>
    )
    }
    if(bodyPost !== undefined && typeof bodyPost === 'object' && 'videoText' in bodyPost){
        return(
            <div className="p-1 py-3 position-relative">
            {bodyPost.videoUrl &&
            <div className="w-100 d-flex justify-content-center">
                <video controls className="w-100 h-auto p-3" 
                style={{maxWidth:'100%', maxHeight:'100%'}}>
                    <source src={bodyPost.videoUrl} type="video/mp4" />
                </video>      
            </div>
            }
            <div className="position-absolute d-flex gap-2" style={{right:'0', bottom:'-1rem', fontSize:'0.8rem'}}>
            {post.likes>0 && <p>{post.likes} mi piace</p>}
            {post.comments.length>0 && <p>{post.comments.length} comment{post.comments.length === 1 ? 'o':'i'}</p>}
        </div>
        </div>
    )
    }
    return null
}

export default PostBody