import { Post } from "../Classes/Posts/PostsClasses";
import { PageProfile } from "../Classes/Profile/Profile";
import { IPost } from "../db";

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
    posts: IPost[];
    bio: string;
    bannerUrl: string;
    following: PageProfile[];    
}