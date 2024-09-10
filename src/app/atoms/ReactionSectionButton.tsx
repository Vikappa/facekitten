'use client'
import { FaRegComment } from "react-icons/fa6";

const ReactionSectionButton = ({icon, testo, funzione, color}: {icon: React.ReactNode, testo: string, funzione: ()=> void; color:string}) => {

    return(
    <button
    className={`border-0 bg-transparent d-flex align-items-center gap-1 rounded-3 p-1 w-100 commentSectionButton d-flex ${color}`}
    onClick={funzione}>{testo}{icon}
    </button>
)
}

export default ReactionSectionButton 