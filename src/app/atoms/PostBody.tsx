import Image from "next/image";

const PostBody = ({bodyPost, postImage}:{bodyPost:string|undefined; postImage:string|undefined}) => {

    if(bodyPost !== undefined){
        return(
            <div className="p-1 py-3">
            {postImage && <Image src={postImage} alt="Post image" width={100} height={80}/>}
            <p>{bodyPost}</p>
        </div>
    )
}
}

export default PostBody