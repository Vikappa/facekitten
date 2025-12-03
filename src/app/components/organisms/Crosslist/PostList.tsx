'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { FaceKittenDB, IPost } from '@/lib/db';
import { PostCard, PostCardAuthorModel, PostCardCommentModel } from './PostCard';

const db = new FaceKittenDB();

export function PostList() {
  const profiles = useLiveQuery(() => db.profiles.toArray(), []);
  const user = useLiveQuery(() => db.userProfile.get(0), []);
  const posts = useLiveQuery(async () => {
    const postsFromDb = await db.posts.toArray();
    const dbUser = await db.userProfile.get(0);
    const userPosts = dbUser?.posts ?? [];

    const merged = new Map<number, IPost>();

    postsFromDb.forEach((p) => {
      if (p?.id != null) merged.set(p.id, p);
    });
    userPosts.forEach((p) => {
      if (p?.id != null) merged.set(p.id, p);
    });

    return Array.from(merged.values());
  }, []);

  if (profiles === undefined || user === undefined || posts === undefined) {
    return null;// TODO LOADER
  }


  const authorsMap = new Map<number, PostCardAuthorModel>();

  if (user) {
    authorsMap.set(0, {
      id: 0,
      username: user.username,
      avatarUrl: user.avatarUrl,
    });
  }

  profiles.forEach((p) => {
    if (p?.id != null) {
      authorsMap.set(p.id, {
        id: p.id,
        username: p.username,
        avatarUrl: p.avatarUrl,
      });
    }
  });

  const safePosts = posts.filter(
    (p): p is IPost & { id: number } => p.id !== null && p.id !== undefined
  );

  const cardModels = [...safePosts]
    .reverse()
    .map((post) => {
      const author =
        authorsMap.get(post.authorId) ??
        {
          id: post.authorId,
          username: 'Sconosciuto',
          avatarUrl: '/default-avatar.png',
        };

      const comments: PostCardCommentModel[] = (post.comments ?? []).map((c) => {
        const cAuthor =
          authorsMap.get(c.authorId) ??
          (c.authorId === 0 && user
            ? {
                id: 0,
                username: user.username,
                avatarUrl: user.avatarUrl,
                commentAuthorPropic: user.avatarUrl,
              }
            : {
                id: c.authorId,
                username: 'Caricamento...',
                avatarUrl: '/default-avatar.png',
                commentAuthorPropic: c.commentAuthorPropic,
              });

        return {
          id: c.id,
          content: c.content,
          authorId: c.authorId,
          authorName: cAuthor.username,
          createdAt: c.createdAt,
          commentAuthorPropic: c.commentAuthorPropic ?? 'FALLBACK STRING TODO',
        };
      });

      return {
        id: post.id!,
        content: post.content,
        createdAt: post.createdAt,
        reactionCount: post.reactCount ?? 0,
        reaction: post.reaction,
        author,
        comments,
      };
    });

  return (
    <div className="flex flex-col gap-2 bg-transparent mt-3">
      {cardModels.map((card) => (
        <PostCard
          key={card.id}
          id={card.id}
          content={card.content}
          createdAt={card.createdAt}
          postReactions={card.reaction}
          author={card.author}
          comments={card.comments}
          db= {db}
        />
      ))}
    </div>
  );
}
