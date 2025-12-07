'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { FaceKittenDB } from '@/lib/db';
import { PostCard, PostCardAuthorModel, PostCardCommentModel } from './PostCard';
import { useEffect, useState } from 'react';
import { useFirstNProfiles } from '@/lib/dbHooks';

const db = new FaceKittenDB();

interface PostCardModel {
  id: string;
  content: string;
  createdAt: string;
  reactionIds: string[];
  author: PostCardAuthorModel;
  comments: PostCardCommentModel[];
  type: 'text' 
}

export function PostList() {
  const user = useLiveQuery(() => db.profiles.get("0"), []);
  const posts = useLiveQuery(() => db.posts.toArray(), []);
  
  const [cardModels, setCardModels] = useState<PostCardModel[]>([]);
  const [loadedProfileNumber, SetLoadedProfileNumber] = useState(15)
  const profilesResult = useFirstNProfiles(loadedProfileNumber);
  const isLoading = profilesResult === undefined || user === undefined || posts === undefined;

  const profiles = profilesResult ?? [];

  useEffect(() => {
    if (isLoading) return; 

    (async () => {
      const models: PostCardModel[] = await Promise.all(
        [...(posts ?? [])].reverse().map(async (post) => {
          const author =
            profiles.find((p) => p.id === post.authorId) ?? {
              id: post.authorId,
              username: 'Sconosciuto',
              avatarUrl: '/default-avatar.png',
            };

          const comments: PostCardCommentModel[] = await Promise.all(
            (post.commentsIds ?? []).map(async (cId) => {
              const Comment = await db.comments.get(cId);
              if (!Comment) throw new Error(`Commento ${cId} non trovato`);

              const cAuthor =
                profiles.find((p) => p.id === Comment.authorId) ?? {
                  id: Comment.authorId,
                  username: 'Caricamento...',
                  avatarUrl: '/default-avatar.png',
                  commentAuthorPropic: Comment.commentAuthorPropic
                };

              return {
                id: cId,
                postId: Comment.postId,
                repliesIds:Comment.repliesIds,
                reactionIds:Comment.reactionIds,
                content: Comment.content,
                authorId: Comment.authorId,
                authorName: cAuthor.username,
                createdAt: Comment.createdAt,
                commentAuthorPropic:
                  Comment.commentAuthorPropic ?? 'FALLBACK STRING TODO',
                  
              };
            })
          );

          return {
            id: post.id!,
            content: post.content,
            createdAt: post.createdAt,
            reactionIds: post.reactionIds,
            author,
            comments,
            type:"text"

          };
        })
      );

      setCardModels(models);
    })();
  }, [isLoading, posts, profiles]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 bg-transparent mt-3">
      {cardModels.map((card) => (
        <PostCard
          key={card.id}
          id={card.id}
          content={card.content}
          createdAt={card.createdAt}
          postReactionsIds={card.reactionIds}
          author={card.author}
          comments={card.comments}
          db={db}
        />
      ))}
    </div>
  );
}
