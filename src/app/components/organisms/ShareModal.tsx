'use client'

import { FaceKittenDB, IImagePost, IMarketplacePost, IPost, IProfile, IVideoPost } from "@/lib/db";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"

type ShareModalContextType = {
    isVisible: boolean;
    postId: string | null;
    openShareModal: (postId: string) => void;
    close: () => void;
};

const ShareModalContext = createContext<ShareModalContextType | undefined>(
    undefined
);

export function ShareModalProvider({ children }: { children: ReactNode }) {
    const db = new FaceKittenDB();

    const [isVisible, setVisible] = useState(false);
    const [postId, setPostId] = useState<string | null>(null);

    const [sharePostContent, SetSharePostContent] = useState<string>("")
    const [sharedPost, setSharedPost] = useState<IPost | null>()
    const [sharedPostAuthor, setSharedPostAuthor] = useState<IProfile | null>()

    


    const openShareModal = useCallback((postId: string) => {
        setPostId(postId);
        setVisible(true);

        async function fetchSharedPostData() {

            const sharedPost = await getFullPostById(postId, db);


            const authorData = await getAuthorById(sharedPost.authorId, db);

            setSharedPostAuthor(authorData);
            setSharedPost(sharedPost); 
        }

        fetchSharedPostData().catch(err => {
            console.error("Error while fetching shared post data:", err);
        });
    }, []);


    const close = useCallback(() => {
        setVisible(false);
        setPostId(null);
        setSharedPost(null)
        setSharedPostAuthor(null)
    }, []);

    return (
        <ShareModalContext.Provider value={{ isVisible, postId, openShareModal, close }}>

            {isVisible && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded shadow w-96">
                        <h2 className="font-bold text-lg mb-2">Stai condividendo il post di {sharedPostAuthor && sharedPostAuthor.username}</h2>

                        <button
                            onClick={close}
                            className="mt-4 px-3 py-1 bg-gray-900 text-white rounded"
                        >
                            Chiudi
                        </button>
                    </div>
                </div>
            )}

            {children}
        </ShareModalContext.Provider>
    );
}

export function useShareModal() {
    const ctx = useContext(ShareModalContext);
    if (!ctx) {
        throw new Error("useShareModal deve essere usato dentro <ShareModalProvider>");
    }
    return ctx;
}


async function getFullPostById(
    postId: string,
    db: FaceKittenDB
): Promise<IPost | IImagePost | IVideoPost | IMarketplacePost> {
    const base = await db.posts.get(postId);

    if (!base) {
        throw new Error(`Post with id ${postId} not found`);
    }

    switch (base.type) {
        case "text":
            // il base è già sufficiente
            return base;

        case "image": {
            const imagePost = await db.imagePosts.get(postId);
            if (!imagePost) {
                // fallback: almeno ritorno il base
                return base as IImagePost;
            }
            return imagePost;
        }

        case "video": {
            const videoPost = await db.videoPosts.get(postId);
            if (!videoPost) {
                return base as IVideoPost;
            }
            return videoPost;
        }

        case "marketplace": {
            const marketPost = await db.marketplacePosts.get(postId);
            if (!marketPost) {
                return base as IMarketplacePost;
            }
            return marketPost;
        }

        default:
            throw new Error(`Unknown post type: ${(base as any).type}`);
    }
}

async function getAuthorById(authorId: string, db: FaceKittenDB): Promise<IProfile> {
    const author = await db.profiles.get(authorId);
    if (!author) throw new Error(`Profile with id ${authorId} not found`);
    return author;
}
