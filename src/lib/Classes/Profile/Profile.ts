import { Post } from "../Posts/PostsClasses";

export class Profile{
    id: number = 0;
    username: string = "";
    avatarUrl: string = "";
    posts: Post[] = [];
    bio: string = "";
    bannerUrl: string = "";
    following: PageProfile[] = [];
}

export class PageProfile extends Profile{
    followers: Profile[] = [];
    likes: Profile[] = [];

    public getFollowersCount(): number {
        return this.followers.length;
    }

    public getLikesCount(): number {
        return this.likes.length;
    }
}