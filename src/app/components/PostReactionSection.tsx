'use client'
import ReactionSectionButton from "../atoms/ReactionSectionButton"
import { AiOutlineLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { RiShareForwardLine } from "react-icons/ri";


const PostReactionSection = () => {

    const fakeFuncton = () => {

    }

    return(
    <>
    <div className="d-flex align-baseline justify-content-evenly">

        <div className="d-flex align-baseline justify-content-evenly">
            <ReactionSectionButton 
            icon={<AiOutlineLike />} 
            testo={"Mi piace"} 
            funzione={fakeFuncton}        
            />
        </div>

        <div className="d-flex align-baseline justify-content-evenly">
            <ReactionSectionButton 
            icon={<FaRegComment />} 
            testo={"Commenta"} 
            funzione={fakeFuncton}        
            />
        </div>

            <div className="d-flex align-baseline justify-content-evenly">
            <ReactionSectionButton 
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