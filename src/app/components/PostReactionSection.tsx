'use client'
import ReactionSectionButton from "../atoms/ReactionSectionButton"
import { AiOutlineLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { RiShareForwardLine } from "react-icons/ri";
import { Post } from "../utils/StorageDataTypes";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { dislikeToUserPost, likeToUserPost } from "../lib/slices/userPostsSlice";
import { userDisliked, userLiked } from "../lib/slices/sessionGeneratedAccountsSlice";


const PostReactionSection = ({setShowCommentSection, post}:{setShowCommentSection:React.Dispatch<React.SetStateAction<boolean>>; post:Post}) => {

    const dispatch = useAppDispatch()
    const userName = useAppSelector(state => state.userCredentials.userName)

    const fakeFuncton = () => {
    }

    const handleDislike = (post:Post) => {
        if(post.author.userName === userName){
            dispatch(dislikeToUserPost({userPost:post}))
        } else {
            dispatch(userDisliked({post}))
        }
    }
    
    const handleLike = (post:Post) => {
        if(post.author.userName === userName){
            dispatch(likeToUserPost({usePost:post}))
        } else {
            dispatch(userLiked({post}))
        }
    }

    return(
    <>
    <div className="d-flex align-baseline justify-content-evenly position-relative">

        {post.userliked ?
            <div className="d-flex align-baseline justify-content-evenly">
                <ReactionSectionButton
                color={'text-primary'} 
                icon={<AiOutlineLike />} 
                testo={"Ti piace"} 
                funzione={() => handleDislike(post)}        
                />
            </div>
        :
            <div className="d-flex align-baseline justify-content-evenly">
                <ReactionSectionButton
                color={''} 
                icon={<AiOutlineLike />} 
                testo={"Mi piace"} 
                funzione={() => handleLike(post)}        
                />
            </div>
        }

        <div className="d-flex align-baseline justify-content-evenly">
            <ReactionSectionButton
            color={''} 
            icon={<FaRegComment />} 
            testo={"Commenta"} 
            funzione={() => setShowCommentSection(true)}        
            />
        </div>

            <div className="d-flex align-baseline justify-content-evenly">
            <ReactionSectionButton
            color={''} 
            icon={<RiShareForwardLine />} 
            testo={"Condividi"} 
            funzione={fakeFuncton}        
            />
        </div>



        </div>
    <hr className="mt-1"/>
    </>
)
}

export default PostReactionSection