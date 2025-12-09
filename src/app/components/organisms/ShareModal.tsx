'use client';

import {
    FaceKittenDB,
    IImagePost,
    IPost,
    IProfile,
    ISharePost,
} from "@/lib/db";
import { formatRelativeTime } from "@/lib/utils";
import Image from "next/image";
import {
    createContext,
    MouseEvent,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";
import { OriginalPostType } from "./Crosslist/SharePostCard";

type ShareModalContextType = {
    isVisible: boolean;
    postId: string | null;
    originalPostType: OriginalPostType | null;
    openShareModal: (postId: string, type: OriginalPostType) => void; close: () => void;
};

const ShareModalContext = createContext<ShareModalContextType | undefined>(
    undefined
);

export function ShareModalProvider({ children }: { children: ReactNode }) {
    const db = new FaceKittenDB();

    const [isVisible, setVisible] = useState(false);
    const [postId, setPostId] = useState<string | null>(null);

    const [sharedPost, setSharedPost] = useState<IPost | IImagePost | null>(null);
    const [sharedPostAuthor, setSharedPostAuthor] = useState<IProfile | null>(null);
    const [originalPostType, setOriginalPostType] =
        useState<OriginalPostType | null>(null);


    const openShareModal = useCallback(
        (postId: string, type: OriginalPostType) => {
            setPostId(postId);
            setOriginalPostType(type);
            setVisible(true);

            async function fetchSharedPostData() {
                let localPost: IPost | IImagePost;

                if (type === 'image') {
                    const imgPost = await db.imagePosts.get(postId);
                    if (!imgPost) throw new Error('Image post not found ' + postId);
                    localPost = imgPost; // QUI è proprio IImagePost
                } else {
                    const textPost = await getFullPostById(postId, db);
                    localPost = textPost; // IPost
                }

                const authorData = await getAuthorById(localPost.authorId, db);

                setSharedPostAuthor(authorData);
                setSharedPost(localPost);
            }

            fetchSharedPostData().catch((err) => {
                console.error('Error while fetching shared post data:', err);
            });
        },
        [db]
    );


    const close = useCallback(() => {
        setVisible(false);
        setPostId(null);
        setOriginalPostType(null);
        setSharedPost(null);
        setSharedPostAuthor(null);
    }, []);


    const hasData =
        !!sharedPostAuthor?.username && !!sharedPost?.createdAt;

    async function handleCondivisione(e: any) {
        e.preventDefault()
        if (sharedPost?.id && sharedPostAuthor?.avatarUrl) {

            const newShareId = crypto.randomUUID();

            const newSHarePost: ISharePost = {
                targetPostId: sharedPost.id,
                id: newShareId,
                authorId: "0",
                content: newSharePostContext,
                createdAt: Date(),
                type: "share",
                reactionIds: [],
                commentsIds: [],
                authorAvatarUrl: sharedPostAuthor.avatarUrl
            }

            if (!sharedPostAuthor?.postIds) sharedPostAuthor.postIds = []

            sharedPostAuthor.postIds.push(newShareId)
            await db.profiles.put(sharedPostAuthor)
            await db.sharePosts.add(newSHarePost)
            setNewSharePostConstext("")
        }


        close()
    }

    const [newSharePostContext, setNewSharePostConstext] = useState("")

    return (
        <ShareModalContext.Provider
            value={{ isVisible, postId, originalPostType, openShareModal, close }}
        >
            {isVisible && hasData && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                    <div className="bg-white text-gray-500 px-2 rounded shadow w-96 pb-1">
                        <span className="px-3 text-xs mb-2">
                            Stai condividendo il post di {sharedPostAuthor!.username}
                        </span>

                        <div className="flex flex-col">
                            <form>
                                <input value={newSharePostContext} onChange={(e) => setNewSharePostConstext(e.target.value)} placeholder="Scrivi cosa ne pensi.." className="w-full border-0 focus:ring-0 focus:outline-none hover:ring-0 rounded px-2 py-1 text-sm" />
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
                                {originalPostType === 'image' &&
                                    sharedPost &&
                                    'imageUrl' in sharedPost &&
                                    sharedPost.imageUrl && (
                                        <div className="relative w-full h-64 mt-2 overflow rounded-xl">
                                            <Image
                                                src={sharedPost.imageUrl}
                                                alt={sharedPost.content}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                                sizes="(min-width: 768px) 600px, 100vw"
                                            />
                                        </div>
                                    )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={close}
                                className="px-3 py-1 bg-gray-300 text-gray-500 rounded text-sm"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={(e) => { handleCondivisione(e) }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
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

