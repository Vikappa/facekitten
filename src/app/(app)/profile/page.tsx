
'use client'
import PostList from "@/app/components/cells/posts/PostList/PostList";
import ProfilePageHero from "@/app/components/cells/ProfilePageHero/ProfilePageHero";
import { useAppSelector } from "@/lib/redux/hooks";

export default function ProfilePage() {
    const profileId = useAppSelector((state) => state.profile.currentProfile?.id)
    const posts = useAppSelector((state) => state.homepagePosts.posts.filter(p => p.authorId == profileId))

    if (!posts) {
        return (
            <div className="grid min-h-[calc(100dvh-56px)] w-full place-items-center bg-white">
                <span className="loaderProfilePictures -translate-y-25" aria-hidden="true"></span>
            </div>
        )
    }

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