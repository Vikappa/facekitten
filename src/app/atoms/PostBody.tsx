import Image from "next/image";
import { Post } from "../utils/StorageDataTypes";

const PostBody = ({bodyPost, postImage, post}:{bodyPost:string|undefined; postImage:string|undefined; post:Post}) => {
    if(bodyPost !== undefined){
        return(
            <div className="p-1 py-3 position-relative">
            {postImage && <Image src={postImage} alt="Post image" width={200} height={200} className="w-100 h-auto p-3" onClick={() => {console.log('open image ', postImage)}}/>}
            <p>{bodyPost}</p>
            <div className="position-absolute" style={{right:'0', bottom:'-1.5rem', fontSize:'0.8rem'}}>
            {post.likes>0 && <p>{post.likes} mi piace</p>}
            {post.comments.length>0 && <p>{post.comments.length} commenti</p>}
        </div>
        </div>
    )
}
}

export default PostBody