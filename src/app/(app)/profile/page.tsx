
'use client'
import ProfilePageHero from "@/app/components/organisms/ProfilePageHero/ProfilePageHero";

export default function ProfilePage() {
    return (
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 sm:px-4 lg:grid-cols-[260px_minmax(0,1fr)_260px] lg:gap-6 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
            <aside className="hidden lg:block" />
            <main className="min-w-0">
                <ProfilePageHero/>
            </main>
            <aside className="hidden lg:block" />
        </div>

    )
}