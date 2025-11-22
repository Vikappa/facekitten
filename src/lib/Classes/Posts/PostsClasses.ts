import { Profile } from "@/lib/Classes/Profile/Profile";
import { PostComment } from "./Comments";

export class Post {
    id: number = 0;
    author: Profile | null = null;
    content: string = "";
    createdAt: Date = new Date();
    comments: PostComment[] = [];
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