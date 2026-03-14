
'use client'
import PostForm from "@/app/components/organisms/PostForm/PostForm";
import PostList from "@/app/components/organisms/PostList/PostList";
import ProfilePageHero from "@/app/components/organisms/ProfilePageHero/ProfilePageHero";
import { useAppSelector } from "@/lib/redux/hooks";

export default function ProfilePage() {
    const profileId = useAppSelector((state) => state.profile.currentProfile?.id)
    const posts = useAppSelector((state) => state.homepagePosts.posts.filter(p => p.authorId == profileId))

    return (
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 sm:px-4 lg:grid-cols-[260px_minmax(0,1fr)_260px] xl:grid-cols-[300px_minmax(0,1fr)_300px]">
            <aside className="hidden lg:block" />
            <main className="min-w-0">
                <ProfilePageHero />
            </main>
            <aside className="hidden lg:block" />
            <PostList posts={posts} />
        </div>

    )
}