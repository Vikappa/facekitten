'use client'

import Image from "next/image"
import { CSSProperties, useState } from "react";
import styles from "../Navbar/NavBarUserButton.module.css";
import { RiLiveFill } from "react-icons/ri";
import { IoMdPhotos } from "react-icons/io";
import { FiSmile } from "react-icons/fi";
import { NavBarActionButton } from "../Navbar/NavbarActionButton";
import { FaceKittenDB, IProfile } from "@/lib/db";
import { Post } from "@/lib/Classes/Posts/PostsClasses";
import { useLiveQuery } from "dexie-react-hooks";

interface CrossListPostFormProps {
    size: number
}

export function CrossListPostForm({ size }: CrossListPostFormProps) {

    const db = new FaceKittenDB

    const userProfile = useLiveQuery(() => db.userProfile.get(0), []);

    const [postText, setPostText] = useState("")



    async function handleSubmit(e: React.FormEvent<HTMLFormElement> | React.FormEvent<HTMLInputElement>) {
        e.preventDefault();

        const userData: IProfile | undefined = await db.userProfile.get(0)

        if (userData === undefined) throw new Error("UserData non trovato")

        const newPost = new Post();
        newPost.content = postText;
        newPost.createdAt = new Date().toString();
        newPost.comments = [];

        const Proto = await newPost.ToInterface(0);
        Proto.id = await db.userProfile.get(0).then(up => up?.posts?.length || 0)



        if (userData?.posts) {
            userData.posts = userData?.posts?.concat(Proto)
            db.userProfile.put(userData);
        }

        setPostText("")
    }


    return (
        <form className="flex p-2 py-3 my-2 bg-white shadow-md" onSubmit={(e) => handleSubmit(e)}>
            {userProfile?.avatarUrl && userProfile?.username ?
                < >
                    <Image
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                        }}
                        src={userProfile?.avatarUrl} alt={userProfile?.username} height={size} width={size} unoptimized className="object-cover rounded-full overflow-hidden " />
                    <input id={"newPostText"} value={postText} onChange={(e) => { setPostText(e.target.value) }} onSubmit={(e) => handleSubmit(e)} className="px-3 mx-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-[0.9px] focus:ring-blue-600" placeholder="A cosa stai fusando?" type="text" />
                    <NavBarActionButton
                        icon={RiLiveFill}
                        size={20}
                        ringClassName=""
                    />
                    <NavBarActionButton
                        size={20}
                        icon={IoMdPhotos}
                        ringClassName=""
                    />
                    <NavBarActionButton
                        size={20}
                        icon={FiSmile}
                        ringClassName=""
                    />
                </>
                :
                <div
                    className={styles.loader}
                    style={
                        {
                            "--size": `${size}px`,
                            "--color": "#000000ab",
                        } as CSSProperties
                    }
                />
            }


        </form>
    )



}