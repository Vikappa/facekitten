import { Profile } from "@/lib/Classes/Profile/Profile";
import { PostComment } from "./Comments";
import { IPost } from "@/lib/db";

export class Post {
    id: number = 0;
    author: Profile | null = null;
    content: string = "";
    createdAt: Date = new Date();
    comments: PostComment[] = [];

    public ToInterface(): IPost {
        return {
            authorId: this.id,
            content: this.content,
            createdAt: new Date(),
            type: "text"
        }
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