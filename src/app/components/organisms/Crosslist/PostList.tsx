'use client';

import { useEffect, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";

import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { FaceKittenDB, IPost, IPostComment, IProfile } from "@/lib/db";
import { addProfile } from "@/lib/features/profiles/profilesSlice";
import { addUserPost, addCommentToUserPost, updateLikeToPost } from "@/lib/features/userData/userDataSlice";
import { PostCard, PostCardAuthorModel, PostCardCommentModel } from "./PostCard";

// ---- SELECTOR REDUX BASE ----

export const selectUserPosts = (state: RootState): IPost[] =>
    state.userData.user?.posts ?? [];

export const selectProfilePosts = (state: RootState): IPost[] =>
    state.profiles.profiles.flatMap((p) => p.posts ?? []);

export const selectAllPosts = createSelector(
    [selectUserPosts, selectProfilePosts],
    (userPosts, profilePosts): IPost[] => [...userPosts, ...profilePosts]
);

interface PostCardViewModel {
    id: number;
    content: string;
    createdAt: string;
    likeCount: number;
    liked: boolean;
    author: PostCardAuthorModel;
    comments: PostCardCommentModel[];
}


const db = new FaceKittenDB();

export function PostList() {
    const dispatch = useDispatch();

    const posts = useAppSelector(selectAllPosts);
    const user = useAppSelector((state) => state.userData.user);
    const profiles = useAppSelector((state) => state.profiles.profiles);

    useEffect(() => {
        const loadProfiles = async () => {
            await db.profiles.each((p: IProfile) => dispatch(addProfile(p)));

            const up = await db.userProfile.get(0);
            up?.posts?.forEach((p) => dispatch(addUserPost(p)));
        };

        loadProfiles();
    }, [dispatch]);

    const authorsMap = useMemo(() => {
        const map = new Map<number, PostCardAuthorModel>();

        if (user) {
            map.set(0, {
                id: 0,
                username: user.username,
                avatarUrl: user.avatarUrl,
            });
        }

        for (const p of profiles) {
            if (!p?.id) continue;
            map.set(p.id, {
                id: p.id,
                username: p.username,
                avatarUrl: p.avatarUrl,
            });
        }

        return map;
    }, [user, profiles]);

    const cardModels: PostCardViewModel[] = useMemo(() => {
        const safePosts = posts.filter(
            (p): p is IPost & { id: number } =>
                p.id !== null && p.id !== undefined
        );

        return [...safePosts]
            .reverse()
            .map((post) => {
                const author =
                    authorsMap.get(post.authorId) ??
                    {
                        id: post.authorId,
                        username: "Sconosciuto",
                        avatarUrl: "/default-avatar.png",
                    };

                const comments: PostCardCommentModel[] = (post.comments ?? []).map(
                    (c) => {
                        const cAuthor =
                            authorsMap.get(c.authorId) ??
                            (c.authorId === 0 && user
                                ? {
                                    id: 0,
                                    username: user.username,
                                    avatarUrl: user.avatarUrl,
                                }
                                : {
                                    id: c.authorId,
                                    username: "Caricamento...",
                                    avatarUrl: "/default-avatar.png",
                                });

                        return {
                            id: c.id,
                            content: c.content,
                            authorId: c.authorId,
                            authorName: cAuthor.username,
                            createdAt: c.createdAt,
                        };
                    }
                );

                return {
                    id: post.id,
                    content: post.content,
                    createdAt: post.createdAt,
                    likeCount: post.likeCount ?? 0,
                    liked: post.liked ?? false,
                    author,
                    comments,
                };
            });
    }, [posts, authorsMap, user]);


    const handleToggleLike = useCallback(
        async (postId: number) => {
            const dbUser = await db.userProfile.get(0);
            if (!dbUser?.posts) return;

            const allPosts = dbUser.posts;
            const thisPostInDB = allPosts.find((p) => p.id === postId);
            if (!thisPostInDB) {
                console.warn("POST WITH ID " + postId + " NOT FOUND IN DB");
                return;
            }

            const newLiked = !thisPostInDB.liked;
            const updatedPosts = allPosts.map((p) =>
                p.id === postId
                    ? {
                        ...p,
                        liked: newLiked,
                        likeCount: Math.max(
                            0,
                            (p.likeCount ?? 0) + (newLiked ? 1 : -1)
                        ),
                    }
                    : p
            );

            await db.userProfile.update(0, { posts: updatedPosts });

            dispatch(updateLikeToPost(postId));
        },
        [dispatch]
    );

    const handleSubmitComment = useCallback(
        async (postId: number, text: string) => {
            const trimmed = text.trim();
            if (!trimmed) return;

            const dbUser = await db.userProfile.get(0);
            if (!dbUser) {
                console.warn("[AddComment] dbUser not found (id=0), abort");
                return;
            }

            dbUser.posts ??= [];
            const thisPostInDB = dbUser.posts.find((p) => p.id === postId);

            if (!thisPostInDB) {
                console.warn("[AddComment] post not found in dbUser.posts", {
                    searchedId: postId,
                    postsIds: dbUser.posts.map((p) => p.id),
                });
                return;
            }

            thisPostInDB.comments ??= [];
            const newCommentId = thisPostInDB.comments.length;

            const newComment: IPostComment = {
                id: newCommentId,
                postId,
                content: trimmed,
                authorId: dbUser.id ?? 0,
                replies: [],
                replyCount: 0,
                createdAt: new Date().toISOString(),
            };

            thisPostInDB.commentCount = (thisPostInDB.commentCount ?? 0) + 1;
            thisPostInDB.comments.push(newComment);

            await db.userProfile.put(dbUser);

            dispatch(addCommentToUserPost(newComment));
        },
        [dispatch]
    );

    return (
        <div className="flex flex-col gap-2 bg-transparent mt-3">
            {cardModels.map((card, index) => (
                <PostCard
                    key={card.id}
                    id={index}
                    content={card.content}
                    createdAt={card.createdAt}
                    likeCount={card.likeCount}
                    liked={card.liked}
                    author={card.author}
                    comments={card.comments}
                    onToggleLike={() => handleToggleLike(card.id)}
                    onSubmitComment={(text) => handleSubmitComment(card.id, text)}
                />
            ))}
        </div>
    );
}
