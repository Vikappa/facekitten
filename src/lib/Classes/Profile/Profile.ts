import { IPost, IProfile } from "@/lib/db";
import { Post } from "../Posts/PostsClasses";

export class Profile {
    id: number = 0;
    username: string = "";
    avatarUrl: string = "";
    posts: Post[] = [];
    bio: string = "";
    bannerUrl: string = "";
    following: PageProfile[] = [];

    public async ToInterface(): Promise<IProfile> {
        return {
            id: this.id,
            username: this.username,
            avatarUrl: this.avatarUrl,
            bio: this.bio,
            bannerUrl: this.bannerUrl,
            posts: await Promise.all(
                (this.posts ?? []).map(p => p.ToInterface(this.id))
            )
        }
    }
}

export class PageProfile extends Profile {
    followers: Profile[] = [];
    likes: Profile[] = [];

    public getFollowersCount(): number {
        return this.followers.length;
    }

    public getLikesCount(): number {
        return this.likes.length;
    }
}