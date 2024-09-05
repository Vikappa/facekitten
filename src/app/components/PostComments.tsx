import PostCommentForm from "../atoms/PostCommentForm"
import PostCommentsList from "../atoms/PostCommentsList"
import { PostComment } from "../utils/StorageDataTypes"

const PostComments = ({comments}:{comments:PostComment[]|undefined}) => {

    return(
        <div className="flex flex-column">
            <PostCommentForm/>
            <PostCommentsList/>
        </div>
    )
}

export default PostComments