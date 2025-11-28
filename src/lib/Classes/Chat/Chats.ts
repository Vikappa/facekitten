import { Profile } from "../Profile/Profile";

export class Chat {
    id: number = 0;
    from: Profile | null = null;
    fromProfileId: number | null = null;
    to: Profile | null = null;
    messages: ChatMessage[] = [];
}

export class GroupChat extends Chat {
    members: Profile[] = [];
}

export class ChatMessage {
    id: number = 0;
    sender: Profile | null = null;
    content: string = "";
    timestamp: Date = new Date();
    mediaUrl?: string;
}

export class ChatLink extends ChatMessage {
    linkUrl: string = "";
    linkTitle: string = "";
    linkDescription: string = "";
    linkImageUrl?: string;
}