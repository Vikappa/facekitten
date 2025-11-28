export class Notification{
    id: number = 0;
    type: 'like' | 'comment' | 'follow' = 'like';
    createdAt: Date = new Date();
    isRead: boolean = false;
    fromProfileId: number = 0;
    toProfileId: number = 0;
}   