import { FaceKittenDB, IPageProfile, IPost, IPostComment, IReaction } from "../db";

export interface IResponseModelFormat {

}

export interface DoMyBioResponseDTO {
    bioText: string;
    mood?: string;
    confidence?: number;
}


export enum  ReactionType{
    like,
    love,
    care,
    laugh,
    wow,
    sad,
    angry,
    gay,
    flower,
    boom,
} 