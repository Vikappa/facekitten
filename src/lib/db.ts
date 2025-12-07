/**
 * Dexie.js Database Configuration
 */

import Dexie, { Table } from 'dexie'
import { ReactionType } from './interfaces/CommonInterfaces'
/**
 * Type definitions for database tables
 */

export interface IProfile {
  id: string
  username: string
  avatarUrl: string
  bio: string
  bannerUrl: string
  createdAt?: Date
  updatedAt?: Date
  postIds: string[]
  followingIds?: string[]
  commentsIds: string[]
}

export interface IPageProfile extends IProfile {
  followersCount: number
  likesCount: number
}

export interface IPost {
  id: string | null
  authorId: string
  content: string
  createdAt: string
  updatedAt?: string
  type: 'text' | 'image' | 'video' | 'marketplace' | 'share' | 'externalLink'
  reactionIds: string[]
  commentsIds:string[]
  authorAvatarUrl: string
}

export interface IReaction {
  id: string
  type: ReactionType
  authorId: string
}

export interface IImagePost extends IPost {
  imageUrl: string
}

export interface IVideoPost extends IPost {
  videoUrl: string
}

export interface IMarketplacePost extends IPost {
  itemName: string
  price: number
  description: string
}
export interface ISharePost extends IPost {
  targetPostId: number;
}

export interface IExternalLinkPost extends IPost {
  url: string;
}


export interface IPostComment {
  id: string
  postId: string
  authorId: string
  content: string
  createdAt: string
  updatedAt?: Date
  repliesIds?: string[]
  commentAuthorPropic: string;
}

export interface IPostCommentReply {
  id: string
  commentId: number
  authorId: number
  content: string
  createdAt: Date
  updatedAt?: Date
}


export interface IChatMessage {
  id: number
  senderId: number
  content: string
  timestamp: Date
  mediaUrl?: string
  chatId: number
}

export interface IChatLink extends IChatMessage {
  linkUrl: string
  linkTitle: string
  linkDescription: string
  linkImageUrl?: string
}

export interface IChat {
  id: number
  fromProfileId: number
  toProfileId: number
  createdAt?: Date
  updatedAt?: Date
}

export interface IGroupChat extends IChat {
  groupName: string
  memberIds: number[]
  lastMessage?: string
}

export interface ICurrentUserPreferences{
  someRandomData: string;
}

/**
 * Dexie Database id
 */
export class FaceKittenDB extends Dexie {
  profiles!: Table<IProfile>
  pageProfiles!: Table<IPageProfile>
  posts!: Table<IPost>
  imagePosts!: Table<IImagePost>
  videoPosts!: Table<IVideoPost>
  marketplacePosts!: Table<IMarketplacePost>
  comments!: Table<IPostComment>
  replies!: Table<IPostCommentReply>
  reactions!: Table<IReaction>
  chats!: Table<IChat>
  groupChats!: Table<IGroupChat>
  messages!: Table<IChatMessage>
  chatLinks!: Table<IChatLink>
  userProfile!: Table<ICurrentUserPreferences>
  constructor() {
    super('FaceKittenDB')
    this.version(2).stores({
      // Profile tables
      profiles: 'id, username',
      pageProfiles: 'id, username',

      posts: 'id, authorId, createdAt',

      comments: 'id, postId, authorId, createdAt',
      replies:  'id, commentId, authorId, createdAt',

      reactions: 'id, authorId, type',

      chats: 'id, fromProfileId, toProfileId, createdAt',
      groupChats: 'id, groupName, createdAt',
      messages: 'id, senderId, chatId, timestamp',
      chatLinks:'id, senderId, chatId, timestamp',

      userProfile: 'id',
      followers: 'id, profileId, followerId',
      likes: 'id, profileId, likerProfileId',
    })
  }
}

/**
 * Initialize the database singleton
 */
export const db = new FaceKittenDB()
