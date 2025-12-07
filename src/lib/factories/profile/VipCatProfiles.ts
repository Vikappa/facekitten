import { IProfile } from "@/lib/db";
import { supabase } from "@/lib/onlineDb";

const vipIds = process.env.NEXT_PUBLIC_VIPIDS?.split(";").filter(Boolean) ?? [];

export async function fetchMissingVipProfiles(currentIds: string[]): Promise<IProfile[]> {

    const toGet = vipIds.filter(vId => !currentIds.includes(vId))

    const { data, error } = await supabase
        .from("Profile")
        .select("*")
        .in("id", toGet);

    if (error) throw error;


    console.log("test query:", data, error);
    debugger
    return data?.map((p) => ({
        id: p.id,
        username: p.username ?? "",
        avatarUrl: p.avatarUrl ?? "",
        bio: p.bio ?? "",
        bannerUrl: p.bannerUrl ?? "",
        createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
        postIds: p.postIds ?? [],
        followingIds: p.followingIds ?? [],
        commentsIds: p.commentsIds ?? [],
    })) ?? [];
}




