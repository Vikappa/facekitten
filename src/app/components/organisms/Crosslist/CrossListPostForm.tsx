'use client'

import Image from "next/image"
import { CSSProperties, useState } from "react";
import styles from "../Navbar/NavBarUserButton.module.css";
import { RiLiveFill } from "react-icons/ri";
import { IoMdPhotos } from "react-icons/io";
import { FiSmile } from "react-icons/fi";
import { NavBarActionButton } from "../Navbar/NavbarActionButton";
import { FaceKittenDB, IImagePost, IPost, IProfile } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { CrossListPostFormToggleImageMode } from "../../atoms/PostForm/CrossListPostFormToggleImageMode";
import { PostFormImageSelection } from "../../atoms/PostForm/PostFormImageSelection";

interface CrossListPostFormProps {
    size: number
}

export function CrossListPostForm({ size }: CrossListPostFormProps) {

    const db = new FaceKittenDB

    const userProfile = useLiveQuery(() => db.profiles.get("0"), []);

    const [postText, setPostText] = useState("")
    const [imageMode, setImageMode] = useState(false)
    const [imageUrl, setImageUrl] = useState("")



    async function handleSubmit(e: React.FormEvent<HTMLFormElement> | React.FormEvent<HTMLInputElement>) {
        e.preventDefault();

        const userData: IProfile | undefined = await db.profiles.get("0")

        if (userData === undefined) throw new Error("UserData non trovato")

        const newPostID = crypto.randomUUID();

        if (imageMode) {
            const newPost: IImagePost = {
                id: newPostID,
                authorId: "0",
                content: "",
                createdAt: Date.now.toString(),
                type: "text",
                imageUrl: imageUrl,
                authorAvatarUrl: "",
                reactionIds: [],
                commentsIds: []
            };
            newPost.content = postText;
            newPost.createdAt = new Date().toString();


            await db.imagePosts.add(newPost)

            if (!userData?.postIds) {
                userData.postIds = []
            }

            setImageMode(false)
            setImageUrl("")
            userData.postIds.push(newPostID)

            await db.profiles.put(userData);
        } else {
            const newPost: IPost = {
                id: newPostID,
                authorId: "0",
                content: "",
                createdAt: Date.now.toString(),
                type: "text",

                authorAvatarUrl: "",
                reactionIds: [],
                commentsIds: []
            };
            newPost.content = postText;
            newPost.createdAt = new Date().toString();

            await db.posts.add(newPost)

            if (!userData?.postIds) {
                userData.postIds = []
            }


            userData.postIds.push(newPostID)

            await db.profiles.put(userData);
        }
        setImageMode(false)
        setPostText("")
    }

    if (!(userProfile?.avatarUrl && userProfile?.username)) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                    className={styles.loader}
                    style={
                        {
                            "--size": `${size}px`,
                            "--color": `#000000ab`,
                        } as CSSProperties
                    }
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <form className={`flex p-2 py-3 my-2 bg-white shadow-md ${imageMode && `mb-0`}`} onSubmit={(e) => handleSubmit(e)}>
                <div
                    style={{
                        width: size,
                        height: size,
                    }}
                    className="overflow-hidden rounded-full flex-shrink-0"
                >
                    <Image
                        src={userProfile.avatarUrl}
                        alt={userProfile.username}
                        width={size}
                        height={size}
                        unoptimized
                        className="object-cover w-full h-full"
                    />
                </div>

                <input id={"newPostText"} value={postText} onChange={(e) => { setPostText(e.target.value) }} onSubmit={(e) => handleSubmit(e)} className="px-3 mx-2 bg-gray-100 rounded-xl w-full focus:outline-none focus:ring-[0.9px] focus:ring-blue-600" placeholder="A cosa stai fusando?" type="text" />
                <NavBarActionButton
                    icon={RiLiveFill}
                    size={20}
                    ringClassName=""
                />
                <CrossListPostFormToggleImageMode functionProp={setImageMode} />
                <NavBarActionButton
                    size={20}
                    icon={FiSmile}
                    ringClassName=""
                />
            </form>
            {imageMode && <PostFormImageSelection currentUrl={imageUrl} setUrl={setImageUrl} />}
        </div>
    )



}