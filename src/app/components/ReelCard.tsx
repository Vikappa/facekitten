'use client'
import Image from "next/image"
import { Post } from "../utils/StorageDataTypes"
import { AiOutlineLike } from "react-icons/ai";

const ReelCard = ({reel}:{reel:Post}) => {

    if(reel.body !== undefined && typeof reel.body === 'object' && 'videoText' in reel.body){
        return(
            <div
            className="p-2 my-2 rounded-3 shadow-sm rounded-4"
            style={{
                width: '100%',
            }}>
                <div className="d-flex gap-2 position-absolute p-2 align-items-center">
                <Image src={reel.author.profilepicture} alt={reel.author.userName} width={40} height={40} className="rounded-circle" />
                <p className="mb-1 text-white fw-semibold d-flex align-items-center gap-1">{reel.author.userName} - <span className="d-flex align-items-center gap-1 p-0 m-0" style={{fontSize:'0.8rem'}}>{reel.likes}<AiOutlineLike className="mb-1"/> likes </span></p>
                </div>
                <video controls
                className="rounded-3"
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