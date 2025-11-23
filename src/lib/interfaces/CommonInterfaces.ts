import { Post } from "../Classes/Posts/PostsClasses";
import { PageProfile } from "../Classes/Profile/Profile";

export interface IResponseModelFormat{

}

export interface DoMyBioResponseDTO  {
    bioText: string;
    mood?: string;
    confidence?: number;
}

export interface UserData{
    username: string;
    avatarUrl: string;
    posts: Post[];
    bio: string;
    bannerUrl: string;
    following: PageProfile[];    
}