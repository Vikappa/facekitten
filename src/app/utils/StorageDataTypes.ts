export interface FriendList {
    id: number;
}

export interface Friend {
    id: number;
    name: string;
    surname: string;
    profilePic: string;
    mutualFriends: number;
    lastMessage: string;
    lastMessageTime: string;
    lastMessageStatus: string;
}

export interface Message {
    id: number;
    sender: string;
    receiver: string;
    message: string;
    timestamp: string;
    status: string;
}
export interface Chat {
    id: number;
    name: string;
    surname: string;
    profilePic: string;
    lastMessage: string;
    lastMessageTime: string;
    lastMessageStatus: string;
    messages: Message[];
}

export interface ChatList {
    id: number;
    name: string;
    surname: string;
    profilePic: string;
    lastMessage: string;
    lastMessageTime: string;
    lastMessageStatus: string;
    messages: Message[];
}

export interface storageData {
    friends: FriendList[];
    chats: ChatList[];
}