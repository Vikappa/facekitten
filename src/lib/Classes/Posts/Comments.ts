import { Profile } from "@/lib/Classes/Profile/Profile";


export class PostComment {
    id: number = 0;
    author: Profile | null = null;
    comment: string = "";
    replies: PostCommentReply[] = [];
}

export class PostCommentReply {
    id: number = 0;
    author: Profile | null = null;
    reply: string = "";
}