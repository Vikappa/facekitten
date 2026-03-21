import { PostType } from "@/types/db.generated";
import { Database } from "@/types/database.types";

export interface IResponseModelFormat {

}

export interface DoMyBioResponseDTO {
    bioText: string;
    mood?: string;
    confidence?: number;
}


export enum ReactionType {
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

export interface CasualArticle{
title:string
description:string
}

export interface NewsApiPayload {
    articles: CasualArticle[]
}

export type PostData = {
    postId:string;
    postType:PostType;
    text:string;
    imageUrl?:string;
    authorId:string;
    authorName:string;
    postImageUrl?:string;
    postedAt:string;
    comments:CommentData[];
    commentNumber:number;
    reactions:ReactionData[];
    reactionsNumber:number;
    shares:SharePostDTO;
}

export type CommentData = {
    authorId:string;
    authorName:string;
    commentedAt:string;
    reactions:string;
    reactionNumbers:number;
}

export type ReactionData = {
    reactionId:string;
    reactionType:ReactionType;
    author:string;
}

export type SharePostDTO = {
    sharePostId: number
}

export type NotificationData = {
    id: number;
    createdAt: string;
    activityFrom: {
        id: string | null;
        name: string;
        avatarUrl: string | null;
    };
    generatedNavigation: string | null;
    notificationType: Database["public"]["Enums"]["notificationtype"] | null;
    previewText: string | null;
}
