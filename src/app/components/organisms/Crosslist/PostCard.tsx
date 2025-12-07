'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CiFaceSmile } from 'react-icons/ci';
import { EmojiMart } from '../../atoms/EmojiMart';
import {
  FaceKittenDB,
  IPostComment,
  IProfile,
  IReaction,
} from '@/lib/db';
import { ReactionMart } from '../../atoms/ReactionMart';
import { ReactionAtom } from '../../atoms/ReactionAtom';
import { ReactionType } from '@/lib/interfaces/CommonInterfaces';
import { PostComment } from '../../atoms/PostComment';
import { useShareModal } from '../ShareModal';
import { formatRelativeTime } from '@/lib/utils';

const LONG_PRESS_MS = 600;

export interface PostCardAuthorModel {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface PostCardCommentModel {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  commentAuthorPropic: string;
  postId: string
  repliesIds: string[]
  reactionIds: string[]
}

export interface PostCardProps {
  id: string;
  content: string;
  createdAt: string;
  postReactionsIds?: string[];
  author: PostCardAuthorModel;
  comments: PostCardCommentModel[];
  db: FaceKittenDB;
}

export function PostCard({
  id,
  content,
  createdAt,
  postReactionsIds,
  author,
  comments,
  db,
}: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isReactionMartOpen, setOpenReactionMart] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [reactions, setReactions] = useState<IReaction[]>([]);
  const [currentReactionStatus, setReactionCurrentStatus] =
    useState<ReactionType | undefined>();
  const [top3Reactions, setTop3Reactions] = useState<ReactionType[]>([]);
  const { openShareModal } = useShareModal();


  useEffect(() => {
    let cancelled = false;

    async function getPostReactions() {
      if (!postReactionsIds || postReactionsIds.length === 0) {
        if (!cancelled) setReactions([]);
        return;
      }

      const raw = await db.reactions.bulkGet(postReactionsIds);
      const filtered = raw.filter(
        (r): r is IReaction => typeof r !== 'undefined'
      );
      if (!cancelled) setReactions(filtered);
    }

    getPostReactions();

    return () => {
      cancelled = true;
    };
  }, [db, postReactionsIds]);

  // Calcola stato utente + top3 reaction
  useEffect(() => {
    if (!reactions || reactions.length === 0) {
      setReactionCurrentStatus(undefined);
      setTop3Reactions([]);
      return;
    }

    const counts = new Map<ReactionType, number>();

    for (const r of reactions) {
      counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
    }

    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const userReaction = reactions.find((r) => r.authorId === '0');

    if (userReaction) {
      setReactionCurrentStatus(userReaction.type);
    } else {
      setReactionCurrentStatus(undefined);
    }

    const top3 = sorted.slice(0, 3).map(([type]) => type);
    setTop3Reactions(top3);
  }, [reactions]);

  /* ------------------------ COMMENTI ------------------------- */

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

  /* ------------------------ REACTION HANDLERS ------------------------- */

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

  /* ------------------------ GESTIONE LONG PRESS ------------------------- */

  const pressRef = useRef<{
    timeoutId: ReturnType<typeof setTimeout> | null;
    longPressTriggered: boolean;
  }>({
    timeoutId: null,
    longPressTriggered: false,
  });

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


  useEffect(() => {
    if (!isReactionMartOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!cardRef.current) return;
      const target = event.target as Node | null;
      if (target && cardRef.current.contains(target)) {
        // click dentro la card → non chiudere qui
        return;
      }

      setOpenReactionMart(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isReactionMartOpen]);

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
            {formatRelativeTime( new Date(createdAt).toLocaleString())}
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

          <span className="flex-1 text-center hover:text-gray-800 cursor-pointer select-none touch-none"
            onClick={() => openShareModal(id)} 
          >
            Condividi
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

/* ------------------------ HELPERS ------------------------- */

async function GetUserProfile(db: FaceKittenDB): Promise<IProfile> {
  const u = await db.profiles.get('0');
  if (u) return u;

  throw new Error(
    "NON SONO RIUSCITO A RECUPERARE I DATI DELL'UTENTE DAL DB LOCALE"
  );
}

export async function upsertReaction(
  db: FaceKittenDB,
  postId: string,
  reactionType?: ReactionType
): Promise<IReaction[]> {
  const user = await GetUserProfile(db);
  const post = await db.posts.get(postId);

  if (!post) {
    throw new Error(`Post ${postId} non trovato`);
  }

  // assicuro che reactionIds esista
  post.reactionIds = post.reactionIds ?? [];

  // recupero tutte le reaction del post
  const allReactions = await db.reactions.bulkGet(post.reactionIds);
  const existingReaction = allReactions.find(
    (r) => r && r.authorId === user.id
  );

  const removeReaction = async (reaction: IReaction) => {
    await db.reactions.delete(reaction.id);
    post.reactionIds = post.reactionIds!.filter((id) => id !== reaction.id);
    await db.posts.put(post);
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
      post.reactionIds.push(newReaction.id);
      await db.posts.put(post);
    }
  } else {
    // reaction scelta dal mart (branch che avevamo già)
    if (!existingReaction) {
      const newReaction: IReaction = {
        id: crypto.randomUUID(),
        type: reactionType,
        authorId: user.id,
      };
      await db.reactions.add(newReaction);
      post.reactionIds.push(newReaction.id);
      await db.posts.put(post);
    } else if (existingReaction.type === reactionType) {
      await removeReaction(existingReaction);
    } else {
      existingReaction.type = reactionType;
      await db.reactions.put(existingReaction);
    }
  }


  // ritorna lo stato aggiornato
  const finalReactions = await db.reactions.bulkGet(post.reactionIds);
  return finalReactions.filter((r): r is IReaction => !!r);
}
