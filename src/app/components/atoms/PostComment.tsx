'use client';

import { db, FaceKittenDB, IPostComment, IReaction } from '@/lib/db';
import { useProfileById } from '@/lib/dbHooks';
import Image from 'next/image';
import { Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState } from 'react';
import { ReactionMart } from './ReactionMart';
import { ReactionAtom } from './ReactionAtom';
import { ReactionType } from '@/lib/interfaces/CommonInterfaces';
import { PostCommentReply } from './PostCommentReply';
import { formatRelativeTime } from '@/lib/utils';

interface PostCommentProps {
    comment: IPostComment;
    db: FaceKittenDB
}

const LONG_PRESS_MS = 600;
const CURRENT_USER_ID = '0';

export function PostComment({ comment, db }: PostCommentProps) {
    const commentAuthor = useProfileById(comment.authorId);
    const [repliesCount, setRepliesCount] = useState(0);
    const [isRepling, setIsRepling] = useState(false)
    const [currentNewReply, setCurrentNewReply] = useState("")

    const [reactions, setReactions] = useState<IReaction[]>([]);
    const [currentReactionStatus, setCurrentReactionStatus] =
        useState<ReactionType | undefined>();
    const [isReactionMartOpen, setReactionMartOpen] = useState(false);

    const pressRef = useRef<{
        timeoutId: ReturnType<typeof setTimeout> | null;
        longPressTriggered: boolean;
    }>({
        timeoutId: null,
        longPressTriggered: false,
    });

    const containerRef = useRef<HTMLDivElement | null>(null);

    /* ------------------------ CARICAMENTO REACTION COMMENTO ------------------------- */

    useEffect(() => {
        let cancelled = false;

        async function loadCommentReactions() {
            const fullComment = await db.comments.get(comment.id);
            const reactionIds = fullComment?.reactionIds ?? [];
            const repliesIds = fullComment?.repliesIds ?? [];
            const repliesLen = repliesIds.length;

            if (reactionIds.length === 0) {
                if (!cancelled) {
                    setReactions([]);
                    setCurrentReactionStatus(undefined);
                    setRepliesCount(repliesLen);
                }
                return;
            }

            const raw = await db.reactions.bulkGet(reactionIds);
            const filtered = raw.filter((r): r is IReaction => !!r);

            if (cancelled) return;

            setReactions(filtered);
            setRepliesCount(repliesLen);
            const userReaction = filtered.find((r) => r.authorId === CURRENT_USER_ID);
            setCurrentReactionStatus(userReaction?.type);
        }

        loadCommentReactions();

        return () => {
            cancelled = true;
        };
    }, [comment.id]);

    /* ------------------------ LONG PRESS / TAP COMMENT REACTION ------------------------- */

    const handlePressStart = (e: React.PointerEvent<HTMLSpanElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);

        if (pressRef.current.timeoutId) {
            clearTimeout(pressRef.current.timeoutId);
        }

        pressRef.current.longPressTriggered = false;

        pressRef.current.timeoutId = setTimeout(() => {
            pressRef.current.longPressTriggered = true;
            setReactionMartOpen(true);
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

        // tap veloce => toggle like
        if (!longPressTriggered) {
            const updated = await upsertCommentReaction(comment.id, undefined);
            setReactions(updated);

            const userReaction = updated.find((r) => r.authorId === CURRENT_USER_ID);
            setCurrentReactionStatus(userReaction?.type);

            setReactionMartOpen(false);
        }

        pressRef.current.longPressTriggered = false;
    };

    const handleReactionSelect = async (reactionType: ReactionType) => {
        const updated = await upsertCommentReaction(comment.id, reactionType);
        setReactions(updated);

        const userReaction = updated.find((r) => r.authorId === CURRENT_USER_ID);
        setCurrentReactionStatus(userReaction?.type);

        setReactionMartOpen(false);
    };

    // chiudi il mart cliccando fuori dal commento
    useEffect(() => {
        if (!isReactionMartOpen) return;

        function handlePointerDown(event: PointerEvent) {
            if (!containerRef.current) return;
            const target = event.target as Node | null;
            if (target && containerRef.current.contains(target)) return;

            setReactionMartOpen(false);
        }

        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [isReactionMartOpen]);

    /* ------------------------ RENDER ------------------------- */

    if (!commentAuthor) return null;


    return (
        <div
            ref={containerRef}
            className="flex items-start gap-2 py-1"
        >

            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                    src={commentAuthor.avatarUrl}
                    alt={commentAuthor.username}
                    width={30}
                    height={30}
                    className="object-cover w-full h-full block"
                    unoptimized
                />
            </div>

            <div className="flex-1">

                <div
                    className="bg-gray-100 text-sm mb-0 px-3 py-2 rounded-lg break-words whitespace-pre-wrap overflow-hidden inline-block"
                    style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    <span className="text-gray-900 text-[14px] font-medium">
                        {commentAuthor.username}:
                    </span>{' '}
                    {comment.content}
                </div>

                {
                    !isRepling &&
                    <div className="flex text-xs gap-3 px-1 text-gray-700 font-medium items-center relative mt-0.5">
                        <span className="text-gray-500">
                            {formatRelativeTime(comment.createdAt)}
                        </span>

                        <span
                            className="cursor-pointer select-none touch-none flex items-center gap-1"
                            onPointerDown={handlePressStart}
                            onPointerUp={handlePressEnd}
                            onPointerCancel={handlePressEnd}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            {currentReactionStatus == null && (
                                <span className="text-gray-800">Mi piace</span>
                            )}

                            {currentReactionStatus === ReactionType.like && (
                                <span className="text-blue-600">Ti piace</span>
                            )}

                            {currentReactionStatus != null &&
                                currentReactionStatus !== ReactionType.like && (
                                    <ReactionAtom type={currentReactionStatus} size={14} />
                                )}
                        </span>

                        {
                            repliesCount === 0 ? (
                                <span onClick={() => { setIsRepling(!isRepling) }} className="cursor-pointer text-gray-700">Rispondi</span>
                            ) : repliesCount === 1 ? (
                                <span onClick={() => { setIsRepling(!isRepling) }} className="cursor-pointer text-gray-700">1 risposta</span>
                            ) : (
                                <span onClick={() => { setIsRepling(!isRepling) }} className="cursor-pointer text-gray-700">
                                    {repliesCount} risposte
                                </span>
                            )
                        }



                        {isReactionMartOpen && (
                            <div className="absolute left-12 bottom-full mb-1 z-20 select-none touch-none">
                                <ReactionMart
                                    onHandleReaction={handleReactionSelect}
                                    currentReactionStatus={currentReactionStatus}
                                />
                            </div>
                        )}

                    </div>
                }

                {
                    isRepling &&

                        <PostCommentReply currentNewReply={currentNewReply} setCurrentNewReply={setCurrentNewReply} setIsRepling={setIsRepling} db={db} comment={comment} onReplyAdded={() => setRepliesCount(c => c + 1)}  />
                }
            </div>
        </div>
    );
}

/* ------------------------ HELPERS ------------------------- */

async function upsertCommentReaction(
    commentId: string,
    reactionType?: ReactionType
): Promise<IReaction[]> {
    const user = await db.profiles.get(CURRENT_USER_ID);
    if (!user) throw new Error('Utente corrente non trovato nel DB');

    const comment = await db.comments.get(commentId);
    if (!comment) throw new Error(`Commento ${commentId} non trovato`);

    comment.reactionIds = comment.reactionIds ?? [];

    const allReactions = await db.reactions.bulkGet(comment.reactionIds);
    const existingReaction = allReactions.find(
        (r) => r && r.authorId === user.id
    );

    const removeReaction = async (reaction: IReaction) => {
        await db.reactions.delete(reaction.id);
        comment.reactionIds = comment.reactionIds!.filter((id) => id !== reaction.id);
        await db.comments.put(comment);
    };

    if (reactionType === undefined) {

        if (existingReaction) {
            await removeReaction(existingReaction);
        } else {
            const newReaction: IReaction = {
                id: crypto.randomUUID(),
                type: ReactionType.like,
                authorId: user.id,
            };
            await db.reactions.add(newReaction);
            comment.reactionIds.push(newReaction.id);
            await db.comments.put(comment);
        }
    } else {

        if (!existingReaction) {
            const newReaction: IReaction = {
                id: crypto.randomUUID(),
                type: reactionType,
                authorId: user.id,
            };
            await db.reactions.add(newReaction);
            comment.reactionIds.push(newReaction.id);
            await db.comments.put(comment);
        } else if (existingReaction.type === reactionType) {

            await removeReaction(existingReaction);
        } else {

            existingReaction.type = reactionType;
            await db.reactions.put(existingReaction);
        }
    }

    const finalRaw = await db.reactions.bulkGet(comment.reactionIds);
    return finalRaw.filter((r): r is IReaction => !!r);
}
