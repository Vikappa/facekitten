import { Profile } from "@/lib/Classes/Profile/Profile";
import { PostComment } from "./Comments";
import { IPost, IPostComment } from "@/lib/db";
import { Reaction } from "../Reaction/Reaction";

export class Post {
    id?: number | undefined | null = 0;
    author: Profile | null = null;
    content: string = "";
    createdAt: string = new Date().toString();
    comments: PostComment[] = [];
    reaction?: Reaction;

    public async ToInterface(authorId: number): Promise<IPost> {
        const comments: IPostComment[] = await Promise.all(
            (this.comments ?? []).map(c =>
                c.ToInterface(this.id ?? 0, authorId)
            )
        );

        return {
            id: this.id ?? undefined,
            reaction: this.reaction && this.reaction.ToInterface(),
            authorId,
            authorAvatarUrl: this.author?.avatarUrl ?? "Error getting avatar url",
            content: this.content,
            createdAt: new Date().toISOString(),
            type: "text",
            comments
        };
    }
}


export class ImagePost extends Post {
    imageUrl: string = "";
}

export class VideoPost extends Post {
    videoUrl: string = "";
}

export class MarketPlacePost extends Post {
    itemName: string = "";
    price: number = 0;
    description: string = "";
}