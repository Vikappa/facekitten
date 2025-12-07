'use client'

import { CrossListPostForm } from "./Crosslist/CrossListPostForm";
import { PostList } from "./Crosslist/PostList";

export function CrossList() {
    return (
        <section className="w-full" >
            <CrossListPostForm size={40} />
            <PostList />
        </section>
    )
}