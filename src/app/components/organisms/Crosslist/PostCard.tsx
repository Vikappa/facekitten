'use client';

import { useState } from "react";
import Image from "next/image";
import { AiTwotoneLike } from "react-icons/ai";
import { CiFaceSmile } from "react-icons/ci";

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
}

export interface PostCardProps {
  id: number;
  content: string;
  createdAt: string;
  likeCount: number;
  liked: boolean;
  author: PostCardAuthorModel;
  comments: PostCardCommentModel[];
  onToggleLike: () => void;
  onSubmitComment: (text: string) => void;
}

export function PostCard({
  id,
  content,
  createdAt,
  likeCount,
  liked,
  author,
  comments,
  onToggleLike,
  onSubmitComment,
}: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");

  const commentCount = comments.length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = commentText.trim();
    if (!trimmed) return;

    onSubmitComment(trimmed);
    setCommentText("");
  }

  return (
    <div className="w-full max-w-full bg-white rounded-xl shadow p-4 my-2 flex flex-col gap-3 border border-gray-200">

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
          wordBreak: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
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
          ) : <div></div>}

          {commentCount === 0 ? (
            <span>Nessun commento</span>
          ) : commentCount === 1 ? (
            <span>1 commento</span>
          ) : (
            <span>{commentCount} commenti</span>
          )}
        </div>

        <div className="flex justify-between text-gray-500 text-sm pt-2 border-t border-gray-100">
          <span
            onClick={onToggleLike}
            className={liked ? "text-blue-600 cursor-pointer" : "text-gray-800 cursor-pointer"}
          >
            Mi piace
          </span>

          <span
            onClick={() => setIsCommenting(!isCommenting)}
            className="hover:text-gray-800 cursor-pointer"
          >
            Commenta
          </span>

          <span className="hover:text-gray-800 cursor-pointer">Condividi</span>
        </div>
      </div>

      {isCommenting && (
        <>
          <form
            className="flex align-middle gap-2 bg-gray-100 rounded-full pe-2 mt-2"
            onSubmit={handleSubmit}
          >
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="p-1 px-3 w-100 focus:outline-none focus:ring-0 flex-1 bg-transparent"
              placeholder="A cosa stai fusando?"
            />
            <CiFaceSmile
              className="text-gray-500 cursor-pointer"
              style={{ height: 40, width: 40 }}
            />
          </form>

          <div className="flex flex-col mt-2">
            {comments.map((comment) => (
              <span key={comment.id}>
                {comment.authorName ?? "Caricamento..."}: {comment.content}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
