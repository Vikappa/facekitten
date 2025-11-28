import { Profile } from "@/lib/Classes/Profile/Profile";
import { FaceKittenDB, IPostComment, IPostCommentReply } from "@/lib/db";


export class PostComment {
    id: number = 0;
    author: Profile | null = null;
    comment: string = "";
    replies: PostCommentReply[] = [];
    static db: FaceKittenDB = new FaceKittenDB();

    public async ToInterface(PostCommentId: number, authorId: number): Promise<IPostComment> {
        const authorData = (authorId === 0) ? await PostComment.db.userProfile.get(0) : await PostComment.db.profiles.get(authorId)
        return {
            id: this.id,
            postId: PostCommentId,
            authorId: authorId,
            content: this.comment,
            commentAuthorPropic: authorData?.avatarUrl ?? "Erro getting commentauthorpropic",
            createdAt: new Date().toISOString(),
            replies: this.replies?.map(c =>
                c.ToInterface(this.id ?? 0, authorId)
            ) ?? []
        }
    }
}

export class PostCommentReply {
    id?: number | undefined | null = 0;
    author: Profile | null = null;
    reply: string = "";
    createdAt?: string;
    updatedAt?: string;
    public ToInterface(postCommentId: number, authId: number): IPostCommentReply {
        return {
            id: this.id ?? 0,
            commentId: postCommentId,
            authorId: authId,
            content: this.reply,
            createdAt: this.createdAt ? new Date(this.createdAt) : new Date(),
            updatedAt: this.updatedAt ? new Date(this.updatedAt) : new Date()
        }
    }
}