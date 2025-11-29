import { IReaction } from "@/lib/db";

export class Reaction{
    id:number = 0;
    reaction?: ReactionType;
    public ToInterface():IReaction{
        return {
            type:ReactionType.like,
            id: this.id
        }
    }
}

export enum ReactionType{
    like,
    love,
    care,
    laugh,
    wow,
    sad,
    angry,
    gay,
    flower,
    boom
}