import { FaceKittenDB, IReaction } from "@/lib/db";

export class Reaction {
    db = new FaceKittenDB();
    id: number = 0;
    reaction?: ReactionType;
    authorId: number;
    public async ToInterface(): Promise<IReaction> {
        const authorFull = await this.db.profiles.get(this.authorId)
        if(!authorFull) throw new Error(`Cannot find Profile id ${this.authorId}`);
        return {
            type: ReactionType.like,
            id: this.id,
            author: authorFull
        }
    }

    constructor(authorId: number, type: ReactionType = ReactionType.like, id: number = 0) {
        this.authorId = authorId;
        this.reaction = type;
        this.id = id;
    }
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
    boom
}