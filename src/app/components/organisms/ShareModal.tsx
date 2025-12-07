'use client';

import {
    FaceKittenDB,
    IImagePost,
    IMarketplacePost,
    IPost,
    IProfile,
    IVideoPost,
} from "@/lib/db";
import { formatRelativeTime } from "@/lib/utils";
import Image from "next/image";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";

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

    const [sharedPost, setSharedPost] = useState<IPost | null>(null);
    const [sharedPostAuthor, setSharedPostAuthor] = useState<IProfile | null>(null);

    const openShareModal = useCallback((postId: string) => {
        setPostId(postId);
        setVisible(true);

        async function fetchSharedPostData() {
            const sharedPost = await getFullPostById(postId, db);
            const authorData = await getAuthorById(sharedPost.authorId, db);

            setSharedPostAuthor(authorData);
            setSharedPost(sharedPost);
        }

        fetchSharedPostData().catch((err) => {
            console.error("Error while fetching shared post data:", err);
        });
    }, [db]);

    const close = useCallback(() => {
        setVisible(false);
        setPostId(null);
        setSharedPost(null);
        setSharedPostAuthor(null);
    }, []);

    const hasData =
        !!sharedPostAuthor?.username && !!sharedPost?.createdAt;

    return (
        <ShareModalContext.Provider
            value={{ isVisible, postId, openShareModal, close }}
        >
            {isVisible && hasData && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                    <div className="bg-white text-gray-500 px-2 rounded shadow w-96 pb-1">
                        <span className="px-3 text-xs mb-2">
                            Stai condividendo il post di {sharedPostAuthor!.username}
                        </span>

                        <div className="flex flex-col">
                            <form>
                                <input placeholder="Scrivi cosa ne pensi.." className="w-full border-0 focus:ring-0 focus:outline-none hover:ring-0 rounded px-2 py-1 text-sm" />
                            </form>

                            <div className="flex flex-col mt-2 border-1 border-gray-300 rounded-sm p-2">
                                <div className="flex gap-2">
                                    <div className="rounded-circle overflow-hidden w-12 h-12">
                                        <Image
                                            src={sharedPostAuthor!.avatarUrl}
                                            alt={sharedPostAuthor!.username}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex flex-col text-xs">
                                        <span className="font-semibold">
                                            {sharedPostAuthor!.username}
                                        </span>
                                        <span className="text-gray-700 text-sm">
                                            {sharedPost!.content}
                                        </span>
                                        <span className="text-gray-400 text-[10px]">
                                            {formatRelativeTime(sharedPost!.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={close}
                                className="px-3 py-1 bg-gray-300 text-gray-900 rounded text-sm"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={close}
                                className="px-3 py-1 bg-gray-900 text-white rounded text-sm"
                            >
                                Condividi
                            </button>
                        </div>
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
async function getFullPostById(postId: string, db: FaceKittenDB): Promise<IPost> {
    const post = await db.posts.get(postId)
    if (post) return post
    throw new Error("Could not find postId" + postId);
}

async function getAuthorById(authorId: any, db: FaceKittenDB): Promise<IProfile> {
    const author = await db.profiles.get(authorId)
    if (author) return author
    throw new Error("Could not find authorId" + authorId);
}

