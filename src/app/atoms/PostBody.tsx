import Image from "next/image";

const PostBody = ({bodyPost, postImage}:{bodyPost:string|undefined; postImage:string|undefined}) => {
    if(bodyPost !== undefined){
        return(
            <div className="p-1 py-3">
            {postImage && <Image src={postImage} alt="Post image" width={200} height={200} className="w-100 h-auto p-3" onClick={() => {console.log('open image ', postImage)}}/>}
            <p>{bodyPost}</p>
        </div>
    )
}
}

export default PostBody