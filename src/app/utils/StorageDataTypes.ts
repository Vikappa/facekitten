export interface FriendList {
    id: number;
}

export interface Post {
    id: number;
    author: UserDetails;
    body: string;
    image: string;
    comments: PostComment[];
    created_at: string;
    likes: number;
}

export interface PostComment {
    id:number;
    author: UserDetails;
    body: string;
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
    posts: Post[]
}

export interface CasualUser {
    name: string;
    profilePic: string;
    posts: Post[]
}

export interface UserDetails{
    userName: string;
    profilepicture:string
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
    posts: Post[]
    userDetails: UserDetails
    sessionGeneratedAccounts: CasualUser[]
}

export interface pexelPayload {
    page:          number;
    per_page:      number;
    photos:        PhotoPayload[];
    total_results: number;
    next_page:     string;
}

export interface PhotoPayload {
    id:               number;
    width:            number;
    height:           number;
    url:              string;
    photographer:     string;
    photographer_url: string;
    photographer_id:  number;
    avg_color:        string;
    src:              photoSrc;
    liked:            boolean;
    alt:              string;
}

export interface photoSrc {
    original:  string;
    large2x:   string;
    large:     string;
    medium:    string;
    small:     string;
    portrait:  string;
    landscape: string;
    tiny:      string;
}