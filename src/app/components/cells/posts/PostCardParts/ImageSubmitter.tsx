'use client'

import type { GetUsersImagePayload, UserImageDto } from "@/app/api/v1/userImages/route";
import { useEffect, useState } from "react";
import "./submitterTranslationCSS.css"
import { FaPlus } from "react-icons/fa";
import Image from "next/image";

interface ImageSubmitterProps {
    isSubmitting: boolean;
    submittingImage: boolean;
    setSubmittingImage: (value: boolean) => void;
}

export default function ImageSubmitter({ isSubmitting, submittingImage, setSubmittingImage }: ImageSubmitterProps) {

    const [images, setImages] = useState<UserImageDto[]>([]);

    async function updatePhotos() {
        try {
            const response = await fetch("/api/v1/userImages", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            const payload = (await response.json().catch(() => null)) as GetUsersImagePayload | null;
            if (payload?.code === "USER_IMAGES_FETCHED" && payload.images) {
                setImages(payload.images);
            } else {
                console.error("Failed to fetch user images:", payload || "Unknown error");
            }
        } catch (error) {
            console.error("Error fetching user images:", error);
        }
    }

    useEffect(() => {
        updatePhotos()
    },[])

    return (
        <div className={`z-50 bg-white imageSubmitterBase ${submittingImage ? `imageSubmitterShown` : `imageSubmitterHidden`} p-2 transition-all duration-300 h-30 flex gap-2 overflow-x-auto overflow-y-hidden`}>
            <div className="bg-tertiary h-25 w-25 shrink-0 rounded-md border border-secondary flex items-center justify-center cursor-pointer" >
                <FaPlus className="text-secondary text-3xl" />
            </div>
            <input type="file" id="imageUploadInput" className="hidden" accept="image/*" />
            {
                images.map((image, index) =>
                    <div className="bg-tertiary h-25 w-25 shrink-0 rounded-md" key={index}>
                        <Image src={image.url} alt={image.name} width={100} height={100} className="object-cover h-full w-full rounded-md" />
                    </div>
                )
            }

        </div>
    )
}
