'use client'

import { CrossListPostForm } from "./Crosslist/CrossListPostForm";
import { PostList } from "./Crosslist/PostList";

export function CrossList() {
    return (
        <section className="bg-white my-4 rounded-xl shadow-md" >
            <CrossListPostForm size={40} />
            <PostList />
        </section>
    )
}