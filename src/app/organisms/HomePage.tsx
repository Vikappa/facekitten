'use client'
import { useEffect, useState } from "react"
import { Post, storageData } from "../utils/StorageDataTypes"
import { FakePostFactory } from "../utils/FakePostFactory/FakePostFactory"
import PostCardComponent from "../components/PostCardComponent"

const HomePage = () => {
    const [navbarPage, setNavbarPage] = useState<number>(0)
    const [post, setPost] = useState<Post|null>(null)
    

    return (
        <div className="row">
            <div className="col-lg-3">

            </div>
            <div className="col-12 col-md-9 col-lg-6 p-3">
            <PostCardComponent/>
            </div>
            <div className="col-0 col-md-3">

            </div>
        </div>
    )
}

export default HomePage