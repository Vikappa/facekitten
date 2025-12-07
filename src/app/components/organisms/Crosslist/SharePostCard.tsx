'use client'

import { FaceKittenDB, IPostComment, IReaction } from "@/lib/db"
import { PostCardAuthorModel, PostCardCommentModel, upsertReaction } from "./PostCard"
import Image from "next/image"
import { formatRelativeTime } from "@/lib/utils"
import { useRef, useState } from "react"
import { ReactionType } from "@/lib/interfaces/CommonInterfaces"
import { ReactionAtom } from "../../atoms/ReactionAtom"
import { ReactionMart } from "../../atoms/ReactionMart"
import { CiFaceSmile } from "react-icons/ci"
import { EmojiMart } from "../../atoms/EmojiMart"
import { PostComment } from "../../atoms/PostComment"
import { usePostFromId } from "@/lib/dbHooks"
const LONG_PRESS_MS = 600;

interface SharePostCardProps {
    id: string
    content: string
    createdAt: string
    postReactionsIds: string[]
    author: PostCardAuthorModel
    comments: PostCardCommentModel[]
    sharedPostId: string
    db: FaceKittenDB
}
export function SharePostCard({ id, content, createdAt, postReactionsIds, author, comments, sharedPostId, db }: SharePostCardProps) {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [reactions, setReactions] = useState<IReaction[]>([]);
    const [top3Reactions, setTop3Reactions] = useState<ReactionType[]>([]);
    const [isCommenting, setIsCommenting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isReactionMartOpen, setOpenReactionMart] = useState(false);
    const [commentText, setCommentText] = useState('');
    const commentInputRef = useRef<HTMLInputElement | null>(null);
    const sharedPost = usePostFromId(sharedPostId)
    const [currentReactionStatus, setReactionCurrentStatus] =
        useState<ReactionType | undefined>();
    const pressRef = useRef<{
        timeoutId: ReturnType<typeof setTimeout> | null;
        longPressTriggered: boolean;
    }>({
        timeoutId: null,
        longPressTriggered: false,
    });

    async function NewLikeReaction(db: FaceKittenDB): Promise<IReaction[]> {
        const updated = await upsertReaction(db, id, undefined);
        setReactions(updated);
        return updated;
    }

    const handleReactionSelect = async (reactionType: ReactionType) => {
        const updated = await upsertReaction(db, id, reactionType);
        setReactions(updated);
        setOpenReactionMart(false);
    };

    const handlePressStart = (e: React.PointerEvent<HTMLSpanElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);

        if (pressRef.current.timeoutId) {
            clearTimeout(pressRef.current.timeoutId);
        }

        pressRef.current.longPressTriggered = false;

        pressRef.current.timeoutId = setTimeout(() => {
            pressRef.current.longPressTriggered = true;

            setShowEmojiPicker(false);
            setOpenReactionMart(true);
        }, LONG_PRESS_MS);
    };

    const handlePressEnd = async (e: React.PointerEvent<HTMLSpanElement>) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }

        const { timeoutId, longPressTriggered } = pressRef.current;

        if (timeoutId) {
            clearTimeout(timeoutId);
            pressRef.current.timeoutId = null;
        }

        if (!longPressTriggered) {
            // tap veloce → toggle like
            await NewLikeReaction(db);
            setOpenReactionMart(false);
        }

        pressRef.current.longPressTriggered = false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = commentText.trim();
        if (!trimmed) return;

        const dbUser = await db.profiles.get('0');
        if (!dbUser) {
            console.warn('[AddComment] dbUser not found (id=0)');
            return;
        }

        const thisPostInDB = await db.posts.get(id);
        if (!thisPostInDB) {
            console.warn(`[AddComment] post not found in db (id=${id})`);
            return;
        }

        const newCommentId = crypto.randomUUID();

        const newComment: IPostComment = {
            id: newCommentId,
            postId: id,
            content: trimmed,
            authorId: dbUser.id,
            createdAt: new Date().toISOString(),
            commentAuthorPropic: dbUser.avatarUrl,
            repliesIds: [],
            reactionIds: []
        };

        thisPostInDB.commentsIds = thisPostInDB.commentsIds ?? [];
        thisPostInDB.commentsIds.push(newCommentId);

        await db.transaction('rw', db.comments, db.posts, async () => {
            await db.comments.add(newComment);
            await db.posts.put(thisPostInDB);
        });

        setCommentText('');
    };

    return (
        <div ref={cardRef} className="w-full max-w-full bg-white rounded-xl shadow p-4 my-2 py-3 pb-2 flex flex-col gap-3 border border-gray-200">
            <div className="flex items-center gap-3">
                <Image
                    className="w-10 h-10 rounded-full bg-gray-300"
                    src={author.avatarUrl}
                    height={40}
                    width={40}
                    alt={author.username}
                    unoptimized
                />
                <div className="flex flex-col leading-tight">
                    <span className="font-semibold text-sm">{author.username}</span>
                    <span className="text-xs text-gray-500">
                        {formatRelativeTime(new Date(createdAt).toLocaleString())}
                    </span>
                </div>
            </div>

            <span
                className="
          text-gray-900 text-[15px]
          leading-relaxed
          break-words
          whitespace-pre-wrap
          overflow-hidden
        "
                style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {content}
                {sharedPost &&
                    <div className="flex flex-col border-1 border-red-700 ">
                        <Image src={sharedPost.authorAvatarUrl} alt={sharedPost.authorId} width={20} height={20} unoptimized />
                        <div className="">
                            <span>{sharedPost.content}</span>
                        </div>
                    </div>
                }
            </span>


            <div className="flex flex-col">
                <div className="flex justify-between">
                    {reactions.length > 0 ? (
                        <span className="flex items-center gap-1 text-gray-700">
                            {top3Reactions.map((rt) => (
                                <ReactionAtom key={rt} type={rt} size={14} />
                            ))}
                            <span className="text-sm">{reactions.length}</span>
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400 select-none touch-none" />
                    )}

                    {comments.length === 0 ? (
                        <span
                            onContextMenu={(e) => e.preventDefault()}
                            className="text-gray-500 text-[12px] select-none touch-none"
                        >
                            Nessun commento
                        </span>
                    ) : comments.length === 1 ? (
                        <span
                            className="text-[12px] text-gray-500 select-none touch-none"
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            1 commento
                        </span>
                    ) : (
                        <span
                            onClick={() => setIsCommenting(!isCommenting)}
                            className="text-gray-500 text-[12px] select-none touch-none"
                        >
                            {comments.length} commenti
                        </span>
                    )}
                </div>

                <div className="flex text-gray-500 text-sm pt-2 border-t border-gray-100 relative">
                    <span
                        onPointerDown={handlePressStart}
                        onPointerUp={handlePressEnd}
                        onPointerCancel={handlePressEnd}
                        className="flex-1 text-center cursor-pointer select-none touch-none"
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        {currentReactionStatus == null && (
                            <span className="select-none touch-none text-gray-700">
                                Mi piace
                            </span>
                        )}

                        {currentReactionStatus === ReactionType.like && (
                            <div className="flex items-center justify-center gap-1">
                                <ReactionAtom type={ReactionType.like} size={20} />
                                <span className="select-none touch-none text-blue-600">
                                    Ti piace
                                </span>
                            </div>
                        )}

                        {currentReactionStatus != null &&
                            currentReactionStatus !== ReactionType.like && (
                                <div className="flex items-center justify-center gap-1">
                                    <ReactionAtom type={currentReactionStatus} size={20} />
                                </div>
                            )}
                    </span>

                    {isReactionMartOpen && (
                        <div className="absolute left-0 top-full mt-1 z-20 select-none touch-none">
                            <ReactionMart
                                onHandleReaction={handleReactionSelect}
                                currentReactionStatus={currentReactionStatus}
                            />
                        </div>
                    )}

                    <span
                        onClick={() => setIsCommenting(!isCommenting)}
                        onContextMenu={(e) => e.preventDefault()}
                        className="flex-1 text-center cursor-pointer select-none touch-none"
                    >
                        Commenta
                    </span>
                </div>
            </div>

            {isCommenting && (
                <>
                    <div className="relative">
                        <form
                            className="flex align-middle gap-2 bg-gray-100 rounded-full pe-2 mt-2"
                            onSubmit={handleSubmit}
                        >
                            <input
                                ref={commentInputRef}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="p-1 px-3 w-100 focus:outline-none focus:ring-0 flex-1 bg-transparent"
                                placeholder="Come rrrrrrispondi?"
                            />
                            <CiFaceSmile
                                className="text-gray-500 cursor-pointer"
                                style={{ margin: 'auto 0' }}
                                size={24}
                                onClick={() => {
                                    setIsCommenting(true);

                                    setOpenReactionMart(false);
                                    setShowEmojiPicker(true);

                                    requestAnimationFrame(() => {
                                        commentInputRef.current?.focus();
                                    });
                                }}
                            />
                        </form>
                        {showEmojiPicker && (
                            <EmojiMart
                                inputRef={commentInputRef}
                                value={commentText}
                                onChange={setCommentText}
                                onClose={() => setShowEmojiPicker(false)}
                            />
                        )}
                    </div>

                    <div className="flex flex-col mt-2">
                        {comments.toReversed().map((comment, key) => (

                            <PostComment comment={comment} key={key} db={db} />

                        ))}
                    </div>

                </>
            )}
        </div>
    );

}

