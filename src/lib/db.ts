/**
 * Dexie.js Database Configuration
 */

import Dexie, { Table } from 'dexie'

/**
 * Type definitions for database tables
 */

export interface IProfile {
  id?: number
  username: string
  avatarUrl: string
  bio: string
  bannerUrl: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IPageProfile extends IProfile {
  followersCount: number
  likesCount: number
}

export interface IPost {
  id?: number
  authorId: number
  content: string
  createdAt: Date
  updatedAt?: Date
  type: 'text' | 'image' | 'video' | 'marketplace'
  likeCount?: number
  commentCount?: number
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

export interface IPostComment {
  id?: number
  postId: number
  authorId: number
  content: string
  createdAt: Date
  updatedAt?: Date
  replyCount?: number
}

export interface IPostCommentReply {
  id?: number
  commentId: number
  authorId: number
  content: string
  createdAt: Date
  updatedAt?: Date
}

export interface IFollower {
  id?: number
  profileId: number
  followerId: number
  createdAt?: Date
}

export interface ILike {
  id?: number
  profileId: number
  likerProfileId: number
  createdAt?: Date
}

export interface IChatMessage {
  id?: number
  senderId: number
  content: string
  timestamp: Date
  mediaUrl?: string
  chatId?: number
}

export interface IChatLink extends IChatMessage {
  linkUrl: string
  linkTitle: string
  linkDescription: string
  linkImageUrl?: string
}

export interface IChat {
  id?: number
  fromProfileId: number
  toProfileId: number
  createdAt?: Date
  updatedAt?: Date
  messageCount?: number
}

export interface IGroupChat extends IChat {
  groupName: string
  memberIds: number[]
  lastMessage?: string
}

/**
 * Dexie Database Class
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
  followers!: Table<IFollower>
  likes!: Table<ILike>
  chats!: Table<IChat>
  groupChats!: Table<IGroupChat>
  messages!: Table<IChatMessage>
  chatLinks!: Table<IChatLink>

  constructor() {
    super('FaceKittenDB')
    this.version(1).stores({
      // Profile tables
      profiles: '++id, username',
      pageProfiles: '++id, username',

      // Post tables
      posts: '++id, authorId, createdAt',
      imagePosts: '++id, authorId, createdAt',
      videoPosts: '++id, authorId, createdAt',
      marketplacePosts: '++id, authorId, createdAt, price',

      // Comment tables
      comments: '++id, postId, authorId, createdAt',
      replies: '++id, commentId, authorId, createdAt',

      // Relationship tables
      followers: '++id, profileId, followerId',
      likes: '++id, profileId, likerProfileId',

      // Chat tables
      chats: '++id, fromProfileId, toProfileId, createdAt',
      groupChats: '++id, groupName, createdAt',
      messages: '++id, senderId, chatId, timestamp',
      chatLinks: '++id, senderId, chatId, timestamp',
    })
  }
}

/**
 * Initialize the database singleton
 */
export const db = new FaceKittenDB()
