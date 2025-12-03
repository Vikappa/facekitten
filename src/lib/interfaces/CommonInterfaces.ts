import { Post } from "../Classes/Posts/PostsClasses";
import { PageProfile } from "../Classes/Profile/Profile";
import { FaceKittenDB, IPost } from "../db";

export interface IResponseModelFormat {

}

export interface DoMyBioResponseDTO {
    bioText: string;
    mood?: string;
    confidence?: number;
}

export interface UserData {
    username: string;
    avatarUrl: string;
    posts: IPost[];
    bio: string;
    bannerUrl: string;
    following: PageProfile[];
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