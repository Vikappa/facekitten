'use client'

import { useMemo, useState } from "react"
import { useAppSelector } from "../lib/hooks"
import { Post } from "../utils/StorageDataTypes"
import ReelCard from "../components/ReelCard"
import { IoMdSettings } from "react-icons/io";
import RoundGreyBorderLess from "../atoms/RoundActivableButton"
import { Form } from "react-bootstrap"
import { FaSearch } from "react-icons/fa";
import DesktopReelSidebar from "../components/DesktopReelSidebar"

const VideoPageOrg = () =>{
    const allPosts = useAppSelector(state => state.sessionGeneratedAccounts.acc.flatMap(user => user.posts))
    const userPosts = useAppSelector(state => state.posts.userPosts)
    const [searchValue, setSearchValue] = useState<string>('')  
    const reels = useMemo(() => {
        const returnArray: Post[] = []
        allPosts.forEach(post => {
            if(post.body !== undefined && typeof post.body === 'object' && 'videoText' in post.body){
                returnArray.push(post)
            }
        })
        userPosts.forEach(post => {
            if(post.body !== undefined && typeof post.body === 'object' && 'videoText' in post.body){
                returnArray.push(post)
            }
        })
        return returnArray
    }, [allPosts,userPosts])

    return(
            <div className="container-fluid p-0" style={{position: 'relative'}}>
                <div className="bg-black d-md-none w-100 h-100 min-vh-100 min-vw-100" style={{zIndex: 1, position: 'absolute', top: 0, left: 0}} />
                
                <div className="d-flex justify-content-center" style={{zIndex: 2, position: 'relative'}}>
                    <div className="bg-white shadow-sm d-none d-md-block" style={{minWidth: '30%'}}>
                        <div className="d-none d-md-flex flex-column py-3" >
                            <div className="d-flex justify-content-between p-3 pb-0">
                                <h2 className="p-0 m-0 fw-semibold">Video</h2>
                                <RoundGreyBorderLess bgSelected={"bg-grayBg"} 
                                bgNotSelected={"bg-grayBg"} 
                                iconSelected={<IoMdSettings size={20} className="ms-auto" />} 
                                iconUnselected={<IoMdSettings size={20} className="ms-auto" />} 
                                selected={false} 
                                onClick={function (): void {
                                throw new Error("Function not implemented.")
                            } } size={0}/>
                            </div>
                        </div>
                        <div className="">
                            <Form className="px-3 d-flex align-items-center position-relative">
                                <FaSearch values={searchValue} className="position-absolute" style={{left: '25px'}} />
                                <Form.Control 
                                type="text" 
                                className={`form-control bg-grayBg rounded-pill border-0 px-3`} 
                                placeholder="    Search" />
                            </Form>
                            <DesktopReelSidebar/>
                        </div>
                    </div>
                    <div className="d-flex p-md-5 flex-column align-items-center" style={{wminidth: '130%'}}>
                        {
                            reels.map(reel => (
                                <ReelCard key={reel.id} reel={reel} />
                            ))
                        }
                    </div>
                </div>
            </div>

    )
}

export default VideoPageOrg