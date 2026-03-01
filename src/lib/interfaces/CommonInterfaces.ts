
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