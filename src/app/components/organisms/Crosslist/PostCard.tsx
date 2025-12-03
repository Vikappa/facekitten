'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CiFaceSmile } from 'react-icons/ci';
import { EmojiMart } from '../../atoms/EmojiMart';
import { FaceKittenDB, IPost, IProfile, IReaction } from '@/lib/db';
import { ReactionMart } from '../../atoms/ReactionMart';
import { ReactionAtom } from '../../atoms/ReactionAtom';
import { ReactionType } from '../../../../lib/Classes/Reaction/Reaction';

const LONG_PRESS_MS = 600;

export interface PostCardAuthorModel {
  id: number;
  username: string;
  avatarUrl: string;
}

export interface PostCardCommentModel {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string;
  commentAuthorPropic: string;
}

export interface PostCardProps {
  id: number;
  content: string;
  createdAt: string;

  postReactions?: IReaction[];
  author: PostCardAuthorModel;
  comments: PostCardCommentModel[];
  db: FaceKittenDB;
}

export function PostCard({
  id,
  content,
  createdAt,
  postReactions,
  author,
  comments,
  db,
}: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isReactionMartOpen, setOpenReactionMart] = useState(false);

  const [reactions, setReactions] = useState<IReaction[]>(postReactions ?? []);

  const [currentReactionStatus, SetReactionCurrentStatus] = useState<ReactionType | undefined>();
  const [top3Reactions, setTop3Reactions] = useState<ReactionType[]>([]);

  useEffect(() => {
    setReactions(postReactions ?? []);
  }, [postReactions]);

  useEffect(() => {
    if (!reactions || reactions.length === 0) {
      SetReactionCurrentStatus(undefined);
      setTop3Reactions([]);
      return;
    }

    const counts = new Map<ReactionType, number>();

    for (const r of reactions) {
      counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
    }

    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

    const userReaction = reactions.find(r => r.author.id === 0);
    if (userReaction) {
      SetReactionCurrentStatus(userReaction.type);
    } else {
      SetReactionCurrentStatus(undefined);
    }

    const top3 = sorted.slice(0, 3).map(([type]) => type);
    setTop3Reactions(top3);
  }, [reactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const dbLocal = new FaceKittenDB();
    const dbUser = await dbLocal.userProfile.get(0);
    if (!dbUser) {
      console.warn('[AddComment] dbUser not found (id=0)');
      return;
    }
    dbUser.posts ??= [];
    const thisPostInDB = dbUser.posts.find((p) => p?.id === id);
    if (!thisPostInDB) {
      console.warn(`[AddComment] post not found in user posts (id=${id})`);
      return;
    }
    thisPostInDB.comments ??= [];
    const newCommentId = thisPostInDB.comments.length;
    const newComment = {
      id: newCommentId,
      postId: id,
      content: trimmed,
      authorId: dbUser.id ?? 0,
      replies: [],
      replyCount: 0,
      createdAt: new Date().toISOString(),
      commentAuthorPropic: dbUser.avatarUrl,
    };
    thisPostInDB.commentCount = (thisPostInDB.commentCount ?? 0) + 1;
    thisPostInDB.comments.push(newComment);
    await dbLocal.userProfile.put(dbUser);
    setCommentText('');
  };

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
      await NewLikeReaction(db);
      setOpenReactionMart(false);
    }

    pressRef.current.longPressTriggered = false;
  };

  return (
    <div className="w-full max-w-full bg-white rounded-xl shadow p-4 my-2 py-3 pb-2 flex flex-col gap-3 border border-gray-200">
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
            {new Date(createdAt).toLocaleString()}
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
            <span className="text-sm text-gray-400 select-none touch-none">
            </span>
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

          <span className="flex-1 text-center hover:text-gray-800 cursor-pointer select-none touch-none">
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
            {comments.map((comment) => (
              <span className="flex items-center" key={comment.id}>
                <div className="w-[20px] h-[20px] rounded-full overflow-hidden">
                  <Image
                    src={comment.commentAuthorPropic}
                    alt={comment.authorName}
                    width={20}
                    height={20}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="text-blue-600 text-sm font-semibold p-1">
                  {comment.authorName ?? 'Caricamento...'}:
                </span>
                <span
                  className="text-sm p-1 break-words whitespace-pre-wrap overflow-hidden"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {comment.content}
                </span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------ HELPERS ------------------------- */

async function GetUserProfile(db: FaceKittenDB): Promise<IProfile> {
  const u = await db.userProfile.get(0);
  if (u) return u;

  // TODO: LOGOUT / gestione errore
  throw new Error('NON SONO RIUSCITO A RECUPERARE I DATI DELL\'UTENTE DAL DB LOCALE');
}

async function getPostAndOwner(
  db: FaceKittenDB,
  postId: number
): Promise<{ owner: IProfile; post: IPost; isUserPost: boolean }> {
  const user = await db.userProfile.get(0);
  if (!user) {
    throw new Error('Utente locale non trovato (id=0)');
  }

  if (user.posts) {
    const post = user.posts.find(p => p?.id === postId);
    if (post) {
      return { owner: user, post, isUserPost: true };
    }
  }

  const profiles = await db.profiles.toArray();
  for (const profile of profiles) {
    const post = profile.posts?.find(p => p?.id === postId);
    if (post) {
      return { owner: profile, post, isUserPost: false };
    }
  }

  throw new Error(`Post ${postId} non trovato né in userProfile né in profiles`);
}


async function upsertReaction(
  db: FaceKittenDB,
  postId: number,
  reactionType?: ReactionType
): Promise<IReaction[]> {
  const user = await GetUserProfile(db);
  const { owner, post, isUserPost } = await getPostAndOwner(db, postId);

  if (!post.reaction) post.reaction = [];

  const userId = 0; 
  const existingIndex = post.reaction.findIndex(r => r.author.id === userId);

  if (reactionType === undefined) {
    // CLICK VELOCE
    if (existingIndex >= 0) {
      post.reaction.splice(existingIndex, 1);
    } else {
      post.reaction.push({
        id: Date.now(),
        type: ReactionType.like,
        author: user,
      });
    }
  } else {
    if (existingIndex >= 0) {
      if (post.reaction[existingIndex].type === reactionType) {
        post.reaction.splice(existingIndex, 1);
      } else {
        post.reaction[existingIndex].type = reactionType;
      }
    } else {
      post.reaction.push({
        id: Date.now(),
        type: reactionType,
        author: user,
      });
    }
  }

  post.reactCount = post.reaction.length;

  if (isUserPost) {
    await db.userProfile.put(owner);
  } else {
    await db.profiles.put(owner);
  }

  return post.reaction;
}
