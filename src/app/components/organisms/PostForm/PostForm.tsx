'use client';

import { type PostData } from "@/lib/interfaces/CommonInterfaces";
import { prependHomepagePost } from "@/lib/redux/homepagePostsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { ProfilePicture } from "../NavbarParts/MidNavbarButtonFunction";
import { ImFilePicture } from "react-icons/im";
import type { NewPostPayload } from "@/app/api/v1/post/add/route";
import { useState, type FormEvent } from "react";

type CreatedPostResponse = {
    code?: string;
    post?: {
        id?: string;
        authorId?: string;
        content?: string;
        mediaUrl?: string | null;
        postType?: PostData["postType"] | null;
        createdAt?: string;
    };
    error?: string;
};

export default function PostForm() {
    const dispatch = useAppDispatch();
    const currentProfile = useAppSelector((state) => state.profile.currentProfile);
    const profileName = currentProfile?.username?.trim() ? currentProfile.username : "Name";
    const profileAvatar = currentProfile?.avatarUrl?.trim() ? currentProfile.avatarUrl : "/assets/blankprofile.png";
    const [postTextValue, setPostTextValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        const normalizedPostText = postTextValue.trim();
        if (!normalizedPostText) {
            setPostError("Scrivi qualcosa prima di pubblicare.");
            return;
        }

        setIsSubmitting(true);
        setPostError(null);

        const postPayload : NewPostPayload = {
            postText: normalizedPostText,
            postImage: undefined
        };

        try {
            const response = await fetch("/api/v1/post/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(postPayload),
            });
            const payload = (await response.json().catch(() => null)) as CreatedPostResponse | null;

            if (!response.ok) {
                setPostError(payload?.error ?? "Impossibile pubblicare il post.");
                return;
            }

            const createdPost = payload?.post;
            if (
                !createdPost ||
                typeof createdPost.id !== "string" ||
                typeof createdPost.authorId !== "string" ||
                typeof createdPost.createdAt !== "string"
            ) {
                setPostError("Post creato ma risposta server non valida.");
                return;
            }

            const postForStore: PostData = {
                postId: createdPost.id,
                postType: createdPost.postType ?? "post",
                text: typeof createdPost.content === "string" ? createdPost.content : normalizedPostText,
                imageUrl: profileAvatar,
                authorId: createdPost.authorId,
                authorName: profileName,
                postImageUrl: typeof createdPost.mediaUrl === "string" ? createdPost.mediaUrl : undefined,
                postedAt: createdPost.createdAt,
                comments: [],
                commentNumber: 0,
                reactions: [],
                reactionsNumber: 0,
                shares: { sharePostId: 0 },
            };

            dispatch(prependHomepagePost(postForStore));
            setPostTextValue("");
        } catch {
            setPostError("Errore di rete durante la pubblicazione.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="flex bg-white p-5 py-4 px-1 shadow-sm" onSubmit={handleSubmit}>
            <ProfilePicture
                imageSrc={profileAvatar ?? "/assets/blankprofile.png"}
                alt="Profile"
                isActive={false}
                className="rounded-full overflow-hidden w-12 h-12 ms-1 me-2"
            />
            <input id="nameInput" type="text" placeholder={`Prrrr-rra ${profileName}?`} className="w-full px-5 py-0 bg-tertiary border-0 rounded-full border-gray-300 focus:outline-none " value={postTextValue} onChange={(e) => {setPostTextValue(e.target.value)}} />
            <div className="flex flex-col py-0 pt-1 px-2 gap-1 items-center justify-content-center">
                <ImFilePicture className="text-green-500 text-2xl " />
                <span className="text-center text-xs">Foto</span>
            </div>
            {postError ? <span className="text-xs text-red-600">{postError}</span> : null}
        </form>
    )
}
