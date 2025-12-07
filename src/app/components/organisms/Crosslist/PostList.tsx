'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { FaceKittenDB, ISharePost } from '@/lib/db';
import { PostCard, PostCardAuthorModel, PostCardCommentModel } from './PostCard';
import { useEffect, useState } from 'react';
import { useFirstNProfiles } from '@/lib/dbHooks';
import { SharePostCard } from './SharePostCard';

const db = new FaceKittenDB();

type PostCardType = 'text' | 'share';

interface BasePostCardModel {
  id: string;
  content: string;
  createdAt: string;
  reactionIds: string[];
  author: PostCardAuthorModel;
  comments: PostCardCommentModel[];
  type: PostCardType;
}

interface SharePostCardModel extends BasePostCardModel {
  type: 'share';
  sharedPostId: string; // id del post originale
}

interface TextPostCardModel extends BasePostCardModel {
  type: 'text';
}

type PostCardModel = TextPostCardModel | SharePostCardModel;

export function PostList() {
  const user = useLiveQuery(() => db.profiles.get('0'), []);
  const posts = useLiveQuery(() => db.posts.toArray(), []);
  const sharePosts = useLiveQuery(() => db.sharePosts.toArray(), []); // <- aggiunta

  const [cardModels, setCardModels] = useState<PostCardModel[]>([]);
  const [loadedProfileNumber] = useState(15);

  const profilesResult = useFirstNProfiles(loadedProfileNumber);
  const isLoading =
    profilesResult === undefined ||
    user === undefined ||
    posts === undefined ||
    sharePosts === undefined;

  const profiles = profilesResult ?? [];

  useEffect(() => {
    if (isLoading) return;

    (async () => {
      // Combino text-post e share-post in un unico array, con info sul tipo
      const combined = [
        ...(posts ?? []).map((p) => ({ kind: 'text' as const, post: p })),
        ...(sharePosts ?? []).map((sp) => ({ kind: 'share' as const, post: sp as ISharePost })),
      ];

      // Ordino per data decrescente
      combined.sort(
        (a, b) =>
          new Date(b.post.createdAt).getTime() -
          new Date(a.post.createdAt).getTime()
      );

      const models: PostCardModel[] = await Promise.all(
        combined.map(async ({ kind, post }) => {
          const author =
            profiles.find((p) => p.id === post.authorId) ?? {
              id: post.authorId,
              username: 'Sconosciuto',
              avatarUrl: '/default-avatar.png',
            };

          const comments: PostCardCommentModel[] = await Promise.all(
            (post.commentsIds ?? []).map(async (cId) => {
              const Comment = await db.comments.get(cId);
              if (!Comment)
                throw new Error(`Commento ${cId} non trovato`);

              const cAuthor =
                profiles.find((p) => p.id === Comment.authorId) ?? {
                  id: Comment.authorId,
                  username: 'Caricamento...',
                  avatarUrl: '/default-avatar.png',
                };

              return {
                id: cId,
                postId: Comment.postId,
                repliesIds: Comment.repliesIds,
                reactionIds: Comment.reactionIds,
                content: Comment.content,
                authorId: Comment.authorId,
                authorName: cAuthor.username,
                createdAt: Comment.createdAt,
                commentAuthorPropic:
                  Comment.commentAuthorPropic ?? 'FALLBACK STRING TODO',
              };
            })
          );

          if (kind === 'share') {
            const share = post as ISharePost;

            const shareModel: SharePostCardModel = {
              id: share.id!,
              content: share.content,
              createdAt: share.createdAt,
              reactionIds: share.reactionIds,
              author,
              comments,
              type: 'share',
              sharedPostId: String(share.targetPostId),
            };

            return shareModel;
          }

          const textModel: TextPostCardModel = {
            id: post.id!,
            content: post.content,
            createdAt: post.createdAt,
            reactionIds: post.reactionIds,
            author,
            comments,
            type: 'text',
          };

          return textModel;
        })
      );

      setCardModels(models);
    })();
  }, [isLoading, posts, sharePosts, profiles]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 bg-transparent mt-3">
      {cardModels.map((card) =>
        card.type === 'share' ? (
          <SharePostCard
            key={card.id}
            id={card.id}
            content={card.content}
            createdAt={card.createdAt}
            postReactionsIds={card.reactionIds}
            author={card.author}
            comments={card.comments}
            sharedPostId={card.sharedPostId}
            db={db}
          />
        ) : (
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
        )
      )}
    </div>
  );
}
