'use client'

import { Post } from "@/lib/Classes/Posts/PostsClasses";
import { Profile } from "@/lib/Classes/Profile/Profile";
import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { createSelector } from "@reduxjs/toolkit";
import { PostCard } from "./PostCard";


export const selectProfiles = (state: RootState): Profile[] =>
    state.profiles.profiles;

export const selectAllPosts = createSelector(
    [selectProfiles],
    (profiles): Post[] => profiles.flatMap((p) => p.posts)
);

export function PostList() {
    const posts = useAppSelector(selectAllPosts);


    return (<div className="flex flex-column">
        {posts && posts.map(post => <PostCard post={post} />)}
    </div>
    )
}