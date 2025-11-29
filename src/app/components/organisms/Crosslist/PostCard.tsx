'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { AiTwotoneLike } from 'react-icons/ai';
import { CiFaceSmile } from 'react-icons/ci';
import { EmojiMart } from '../../atoms/EmojiMart';
import { FaceKittenDB, IReaction } from '@/lib/db';
import { ReactionMart } from '../../atoms/ReactionMart';
import { ReactionAtom } from '../../atoms/ReactionAtom';

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
  likeCount: number;
  reaction?: IReaction | false;
  author: PostCardAuthorModel;
  comments: PostCardCommentModel[];
}

export function PostCard({
  id,
  content,
  createdAt,
  likeCount,
  reaction,
  author,
  comments,
}: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isReactionMartOpen, setOpenReactionMart] = useState(false);

  const hasReaction = reaction !== undefined && reaction !== false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const db = new FaceKittenDB();
    const dbUser = await db.userProfile.get(0);
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
    await db.userProfile.put(dbUser);
    setCommentText('');
  };

  const handleReactionSelect = async (reactionId: number) => {
    const db = new FaceKittenDB();
    const dbUser = await db.userProfile.get(0);
    if (!dbUser?.posts) return;
    const thisPostInDB = dbUser.posts.find((p) => p?.id === id);
    if (!thisPostInDB) return;

    if (thisPostInDB.reaction && thisPostInDB.reaction.id === reactionId) {
      thisPostInDB.reaction = undefined;
      thisPostInDB.reactCount = Math.max(0, (thisPostInDB.reactCount ?? 1) - 1);
    } else {
      if (!thisPostInDB.reaction) {
        thisPostInDB.reactCount = (thisPostInDB.reactCount ?? 0) + 1;
      }
      thisPostInDB.reaction = { id: reactionId, type: reactionId as any };
    }

    await db.userProfile.put(dbUser);
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
      if (hasReaction && reaction && !!reaction === true) {
        await handleReactionSelect(reaction.id);
      } else {
        await handleReactionSelect(0);
      }

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
          {(likeCount ?? 0) > 0 ? (
            <span className="flex items-center gap-1 text-gray-700">
              <span className="text-sm">{likeCount}</span>
              <AiTwotoneLike className="text-blue-600 text-[16px] pb-1" />
            </span>
          ) : (
            <div></div>
          )}

          {comments.length === 0 ? (
            <span  onContextMenu={(e) => e.preventDefault()} className="text-gray-500 text-[15px] select-none touch-none">Nessun commento</span>
          ) : comments.length === 1 ? (
            <span className="text-[15px] select-none touch-none" onContextMenu={(e) => e.preventDefault()} >1 commento</span>
          ) : (
            <span
              onClick={() => setIsCommenting(!isCommenting)}
              className="text-gray-500 text-[15px] select-none touch-none"
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
            className={`flex-1 text-center cursor-pointer select-none touch-none`}
             onContextMenu={(e) => e.preventDefault()}
          >
            {!reaction ? (
              <span onContextMenu={(e) => e.preventDefault()} className='select-none touch-none'>Mi piace</span>
            ) : (
              <ReactionAtom type={reaction.type} size={24} />
            )}
          </span>

          {isReactionMartOpen && (
            <div className="absolute left-0 top-full mt-1 z-20 select-none touch-none">
              <ReactionMart onHandleReaction={handleReactionSelect} />
            </div>
          )}

          <span
            onClick={() => setIsCommenting(!isCommenting)}
             onContextMenu={(e) => e.preventDefault()}
            className={`flex-1 text-center cursor-pointer select-none touch-none`
            }
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
