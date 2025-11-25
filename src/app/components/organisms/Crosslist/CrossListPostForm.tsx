'use client'

import { UserData } from "@/lib/interfaces/CommonInterfaces"
import Image from "next/image"
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { CSSProperties, useState } from "react";
import styles from "../Navbar/NavBarUserButton.module.css";
import { RiLiveFill } from "react-icons/ri";
import { IoMdPhotos } from "react-icons/io";
import { FiSmile } from "react-icons/fi";
import { NavBarActionButton } from "../Navbar/NavbarActionButton";
import { useDispatch } from "react-redux";
import { addUserPost } from "@/lib/features/userData/userDataSlice";
import { FaceKittenDB, IProfile } from "@/lib/db";
import { Post } from "@/lib/Classes/Posts/PostsClasses";
import { PageProfile, Profile } from "@/lib/Classes/Profile/Profile";

interface CrossListPostFormProps {
    size: number
}

export function CrossListPostForm({ size }: CrossListPostFormProps) {

    const dispatch = useDispatch()
    const db = new FaceKittenDB

    const userProfile = useSelector(
        (state: RootState): UserData | null => state.userData.user
    );
    const [postText, setPostText] = useState("")



    async function handleSubmit(e: React.FormEvent<HTMLFormElement> | React.FormEvent<HTMLInputElement>) {
        e.preventDefault();

        const userData: IProfile | undefined = await db.userProfile.get(0)

        if (userData === undefined) throw new Error("UserData non trovato")

        const newPost = new Post();
        newPost.content = postText;
        newPost.createdAt = new Date().toString();
        newPost.comments = [];

        const Proto = newPost.ToInterface(0);
        Proto.id = await db.userProfile.get(0).then(up => up?.posts?.length || 0)



        if (userData?.posts) {
            console.log("ADDING TO REDUX STORE")
            userData.posts = userData?.posts?.concat(Proto)
            db.userProfile.put(userData);
            dispatch(addUserPost(Proto))
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
                    <input id={"newPostText"} value={postText} onChange={(e) => { setPostText(e.target.value) }} onSubmit={(e) => handleSubmit(e)} className="px-3 mx-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-[0.9px] focus:ring-blue-600" placeholder="A cosa stai pensando?" type="text" />
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