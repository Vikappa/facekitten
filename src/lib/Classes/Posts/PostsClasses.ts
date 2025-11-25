import { Profile } from "@/lib/Classes/Profile/Profile";
import { PostComment } from "./Comments";
import { IPost } from "@/lib/db";

export class Post {
    id?: number | undefined | null = 0;
    author: Profile | null = null;
    content: string = "";
    createdAt: string = new Date().toString();
    comments: PostComment[] = [];
    liked: boolean = false;
public ToInterface(authorId: number): IPost {
    return {
        id: this.id ?? undefined,
        liked: this.liked,
        authorId,
        content: this.content,
        createdAt: new Date().toISOString(),
        type: "text",
        comments: this.comments?.map(c =>
            c.ToInterface(this.id ?? 0, authorId)
        ) ?? []
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