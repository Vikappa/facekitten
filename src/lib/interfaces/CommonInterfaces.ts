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

export type ProfileMetadata = {
    id: string;
    username: string;
    avatarUrl: string;
    bannerUrl?: string | null;
    bio?: string | null;
    confirmedAccount?: boolean | null;
    createdAt?: string;
    updatedAt?: string | null;
    dataDiNascita?: string | null;
    giocattoloPreferito?: string | null;
    locationId?: string | null;
    tipoCuccia?: Database["public"]["Enums"]["Lettino"] | null;
}

export interface ChatThreadProfileMetadata {
    id: string;
    profileUrl: string;
    username?: string;
    avatarUrl?: string | null;
}

export interface ChatData {
    chatId: string;
    text?: string | null;
    fromProfileId?: string | null;
    toProfileId?: string | null;
    createdAt?: string;
}

export interface ChatThreadData {
    withProfile: ChatThreadProfileMetadata;
    chats: ChatData[];
    lastMessageAt: string;
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
    postExtraContent?: string | null;
    postMediaUrl?: string | null;
    authorProfile?: ProfileMetadata | null;
    createdAt?: string;
    subPostData: PostData | null;
}

export type CommentData = {
    commentId:string;
    authorId:string;
    authorName:string;
    commentAuthorPropic:string;
    commentedAt:string;
    reactions:ReactionData[];
    reactionNumbers:number;
    commentText:string;
    commentReplies:CommentReplyData[];
    commentRepliesCount:number
    postId?: string | null;
    commentExtraContent?: string | null;
    authorProfile?: ProfileMetadata | null;
    createdAt?: string;
}

export type CommentReplyData = {
    commentReplyId?: string;
    repliedCommentId?: string | null;
    authorId:string;
    authorName:string;
    replyAuthorPropic:string;
    repliedAt:string;
    commentReplyText?: string;
    commentReplyMediaUrl?: string | null;
    commentReplyExtraContent?: string | null;
    authorProfile?: ProfileMetadata | null;
    createdAt?: string;
    commentReplyReactions:ReactionData[];
}

export type ReactionData = {
    reactionId:string;
    reactionType:ReactionType;
    author:string;
    authorId?: string | null;
    authorAvatarUrl?: string | null;
    authorProfile?: ProfileMetadata | null;
    createdAt?: string;
    targetType?: "post" | "comment" | "commentReply";
    targetId?: string | null;
}

export type SharePostDTO = {
    sharePostId: number
}

export type NotificationData = {
    id: string;
    createdAt: string;
    activityFromId?: string | null;
    toProfileId?: string | null;
    seen?: boolean | null;
    activityFrom: {
        id: string | null;
        name: string;
        avatarUrl: string | null;
    };
    generatedNavigation: string | null;
    notificationType: Database["public"]["Enums"]["notificationtype"] | null;
    previewText: string | null;
    activityFromProfile?: ProfileMetadata | null;
    relatedPostId?: string | null;
    relatedCommentId?: string | null;
    relatedCommentReplyId?: string | null;
}
