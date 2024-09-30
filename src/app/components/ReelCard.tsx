'use client'
import Image from "next/image"
import { Post } from "../utils/StorageDataTypes"
import { AiOutlineLike } from "react-icons/ai";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";

const ReelCard = ({reel}:{reel:Post}) => {

    const router = useRouter()
    if(reel.body !== undefined && typeof reel.body === 'object' && 'videoText' in reel.body){
        return(
                <div
                    className="rounded-3 shadow-sm rounded-md-4 position-relative my-md-3 mb-md-5" 
                    style={{
                        zIndex: 3,
                        width: '100%',
                        height: '100vh',
                        backgroundColor: 'black',
                    }}>
                    <div className="d-flex flex-column position-absolute p-0 m-0 align-items-start">
                    <button 
                        onClick={(e)=>{
                            e.preventDefault()
                            router.back()
                        }}
                        className="p-0 px-2 text-white m-0 d-flex align-items-center bg-transparent border-0" 
                        style={{
                            fontSize:'0.75rem',
                            zIndex: 10, 
                            position: 'relative'
                        }}>
                        <IoIosArrowRoundBack size={20} className="p-0 m-0" /> Indietro
                    </button>

                        <div className="d-flex gap-2 px-2">
                        <Image src={reel.author.profilepicture} alt={reel.author.userName} width={40} height={40} className="rounded-circle" />
                        <p className="mb-1 text-white fw-semibold d-flex align-items-center gap-1">{reel.author.userName} - <span className="d-flex align-items-center gap-1 p-0 m-0" style={{fontSize:'0.8rem'}}>{reel.likes}<AiOutlineLike className="mb-1"/> likes </span></p>
                        </div>
                    </div>
                    <video controls
                        className="rounded-md-3"
                        style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'cover',
                        }}>
                        <source src={reel.body.videoUrl} type="video/mp4" />
                    </video>
                </div>

        )
    }
}

export default ReelCard