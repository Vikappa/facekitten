export interface FriendList {
    id: number;
}

export interface Post {
    id: number;
    author: UserDetails;
    body: NormalPostBody | MarketPlacePostString | ImagePostBody | VideoPostBody | Retweetpostbody;
    comments: PostComment[];
    created_at: string;
    likes: number;
    userliked: boolean;
    likeProfiles: UserDetails[];
}

export interface NormalPostBody{
    normalPostTex: string;
}


export interface MarketPlacePostString{
    marketplaceTitle: string;
    marketPlaceText: string;
    marketplacePrice: string;
    marketplacePhotoUrl: string;
}

export interface ImagePostBody{
    imageUrl:string;
    imagePostText: string;
    generativeContext:string;
}

export interface VideoPostBody{
    videoUrl:string;
    videoText: string;
    generativeContext:string;
}

export interface Retweetpostbody {
    rewtweetText: string;
    userName: string;
    profilePicture: string;
}

export interface PostComment {
    id:number;
    author: UserDetails;
    body: string;
    commented_at: string;
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
    id:number;
    name: string;
    profilePic: string;
    posts: Post[]
    coverPhotoUrl: string;
    friends: []
}

export interface UserDetails{
    userName: string;
    profilepicture:string
    coverPhotoUrl: string;
}

export interface Message {
    id: number;
    sender: UserDetails;
    receiver: UserDetails;
    message: string;
    timestamp: string;
    seen: boolean;
}
export interface Chat {
    id: number;
    chatWith: UserDetails;
    lastMessage: string;
    lastMessageTime: string;
    lastMessageStatus: string;
    messages: Message[];
}


export interface storageData {
    friends: FriendList[];
    posts: Post[]
    userDetails: UserDetails
    sessionGeneratedAccounts: CasualUser[]
    notifications: NotificationType[];
}

export interface NotificationType {
    id: number;
    type: number;
    seen:boolean;
    body: PostCommentNotificationType | CommentReplyNotificationType
}

export interface PostCommentNotificationType {
    postId: number;
    postAuthor: UserDetails;
    commentAuthor: UserDetails;
}

export interface CommentReplyNotificationType {
    postId: number;
    postAuthor: UserDetails;
    commentAuthor: UserDetails;
}

export interface LikeNotificationType {
    likedPost: Post;
    likeAuthor: UserDetails;
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

export interface NewsApiPayload {
    status:       string;
    totalResults: number;
    articles:     NewsArticle[];
}

export interface NewsArticle {
    source:      NewsSource;
    author:      null | string;
    title:       string;
    description: string;
    url:         string;
    urlToImage:  string;
    publishedAt: Date;
    content:     string;
}

export interface NewsSource {
    id:   null | string;
    name: string;
}
