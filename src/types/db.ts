import type {
  Database,
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database.types'

const toDate = (value: string | null | undefined): Date | undefined => {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

const toRequiredString = (value: string | null | undefined): string => value ?? ''

const toOptionalString = (value: string | null | undefined): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const toOptionalNumber = (value: number | null | undefined): number | undefined =>
  typeof value === 'number' ? value : undefined

const toBoolean = (value: boolean | null | undefined, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback

export type TableName = keyof Database['public']['Tables']
export type PostType = Enums<'postType'>
export type ReactionType = Enums<'ReactionType'>
export type NotificationType = Enums<'notificationtype'>

export const mapRows = <TDb, TDto>(
  rows: TDb[] | null | undefined,
  mapper: (row: TDb) => TDto
): TDto[] => (rows ?? []).map(mapper)

// Profile
export type ProfileRow = Tables<'Profile'>
export type ProfileInsert = TablesInsert<'Profile'>
export type ProfileUpdate = TablesUpdate<'Profile'>

export type ProfilePublicDb = Pick<
  ProfileRow,
  | 'id'
  | 'email'
  | 'username'
  | 'avatarUrl'
  | 'bannerUrl'
  | 'bio'
  | 'confirmedAccount'
  | 'created_at'
  | 'updated_at'
>

export type ProfilePublicFriendDb = ProfilePublicDb &
  Pick<
    ProfileRow,
    'dataDiNascita' | 'giocattoloPreferito' | 'tipoCuccia' | 'locationId'
  >

export type ProfileAuthDb = Pick<
  ProfileRow,
  'id' | 'email' | 'username' | 'password' | 'confirmedAccount'
>

export type ProfileVerificationDb = Pick<
  ProfileRow,
  'id' | 'email' | 'username' | 'password' | 'confirmedAccount' | 'created_at'
>

export interface ProfileDto {
  id: string
  email: string
  username: string
  avatarUrl: string
  bannerUrl: string
  bio: string
  confirmedAccount: boolean
  createdAt?: Date
  updatedAt?: Date
  locationId?: string | null
  dataDiNascita?: Date | null
  giocattoloPreferito?: string
  tipoCuccia?: Database["public"]["Enums"]["Lettino"] | null
}

export interface ProfileAuthDto {
  id: string
  email: string
  username: string
  passwordHash?: string
  confirmedAccount: boolean
}

export const PROFILE_PUBLIC_SAFE_SELECT =
  'id, email, username, avatarUrl, bannerUrl, bio, confirmedAccount, created_at, updated_at' as const

export const PROFILE_PUBLIC_FRIEND_SELECT =
  `${PROFILE_PUBLIC_SAFE_SELECT}, dataDiNascita, giocattoloPreferito, tipoCuccia, locationId` as const

export const PROFILE_AUTH_SAFE_SELECT =
  'id, email, username, password, confirmedAccount' as const

export const PROFILE_VERIFICATION_SAFE_SELECT =
  'id, email, username, password, confirmedAccount, created_at' as const

export function toProfileDto(row: ProfilePublicDb | ProfilePublicFriendDb): ProfileDto {
  const friendRow = row as Partial<ProfilePublicFriendDb>

  const hasFriendFields =
    'giocattoloPreferito' in row ||
    'tipoCuccia' in row ||
    'locationId' in row ||
    'dataDiNascita' in row

  return {
    id: row.id,
    email: toRequiredString(row.email),
    username: toRequiredString(row.username),
    avatarUrl: toRequiredString(row.avatarUrl),
    bannerUrl: toRequiredString(row.bannerUrl),
    bio: toRequiredString(row.bio),
    confirmedAccount: toBoolean(row.confirmedAccount),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
    ...(hasFriendFields
      ? {
          giocattoloPreferito: friendRow.giocattoloPreferito ?? '',
          tipoCuccia: friendRow.tipoCuccia ?? null,
          locationId: friendRow.locationId ?? null,
          dataDiNascita: toDate(friendRow.dataDiNascita) ?? null,
        }
      : {}),
  }
}

export function toProfileAuthDto(row: ProfileAuthDb): ProfileAuthDto {
  return {
    id: row.id,
    email: toRequiredString(row.email),
    username: toRequiredString(row.username),
    passwordHash: toOptionalString(row.password),
    confirmedAccount: toBoolean(row.confirmedAccount),
  }
}

// Post
export type PostRow = Tables<'post'>
export type PostInsert = TablesInsert<'post'>
export type PostUpdate = TablesUpdate<'post'>

export type PostDb = Pick<
  PostRow,
  'id' | 'authorId' | 'content' | 'extraContent' | 'mediaUrl' | 'postType' | 'created_at'
>

export interface PostDto {
  id: string
  authorId: string
  content: string
  extraContent?: string
  mediaUrl?: string
  postType?: PostType
  createdAt?: Date
}

export const POST_SAFE_SELECT =
  'id, authorId, content, extraContent, mediaUrl, postType, created_at' as const

export function toPostDto(row: PostDb): PostDto {
  return {
    id: row.id,
    authorId: row.authorId,
    content: toRequiredString(row.content),
    extraContent: toOptionalString(row.extraContent),
    mediaUrl: toOptionalString(row.mediaUrl),
    postType: row.postType ?? undefined,
    createdAt: toDate(row.created_at),
  }
}

// Comment
export type CommentRow = Tables<'comment'>
export type CommentInsert = TablesInsert<'comment'>
export type CommentUpdate = TablesUpdate<'comment'>

export type CommentDb = Pick<
  CommentRow,
  'commentId' | 'commentAuthorId' | 'postid' | 'commentText' | 'extraContent'
>

export interface CommentDto {
  id: string
  authorId?: string
  postId?: string
  commentText: string
  extraContent?: string
}

export const COMMENT_SAFE_SELECT =
  'commentId, commentAuthorId, postid, commentText, extraContent' as const

export function toCommentDto(row: CommentDb): CommentDto {
  return {
    id: row.commentId,
    authorId: toOptionalString(row.commentAuthorId),
    postId: toOptionalString(row.postid),
    commentText: toRequiredString(row.commentText),
    extraContent: toOptionalString(row.extraContent),
  }
}

// Comment reply
export type CommentReplyRow = Tables<'commentReply'>
export type CommentReplyInsert = TablesInsert<'commentReply'>
export type CommentReplyUpdate = TablesUpdate<'commentReply'>

export type CommentReplyDb = Pick<
  CommentReplyRow,
  'commentReplyId' | 'commentReplyAuthorId' | 'repliedComment' | 'text' | 'mediaUrl' | 'extraContent'
>

export interface CommentReplyDto {
  id: string
  authorId?: string
  repliedComment?: string
  text: string
  mediaUrl?: string
  extraContent?: string
}

export const COMMENT_REPLY_SAFE_SELECT =
  'commentReplyId, commentReplyAuthorId, repliedComment, text, mediaUrl, extraContent' as const

export function toCommentReplyDto(row: CommentReplyDb): CommentReplyDto {
  return {
    id: row.commentReplyId,
    authorId: toOptionalString(row.commentReplyAuthorId),
    repliedComment: toOptionalString(row.repliedComment),
    text: toRequiredString(row.text),
    mediaUrl: toOptionalString(row.mediaUrl),
    extraContent: toOptionalString(row.extraContent),
  }
}

// Post reaction
export type PostReactionRow = Tables<'postReaction'>
export type PostReactionInsert = TablesInsert<'postReaction'>
export type PostReactionUpdate = TablesUpdate<'postReaction'>

export type PostReactionDb = Pick<
  PostReactionRow,
  'id' | 'reactedBy' | 'reactedPost' | 'reactionType'
>

export interface PostReactionDto {
  id: string
  authorId?: string
  postId?: string
  reactionType?: ReactionType
}

export const POST_REACTION_SAFE_SELECT =
  'id, reactedBy, reactedPost, reactionType' as const

export function toPostReactionDto(row: PostReactionDb): PostReactionDto {
  return {
    id: String(row.id),
    authorId: toOptionalString(row.reactedBy),
    postId: toOptionalString(row.reactedPost),
    reactionType: row.reactionType ?? undefined,
  }
}

// Comment reaction (schema has "athorId")
export type CommentReactionRow = Tables<'commentReaction'>
export type CommentReactionInsert = TablesInsert<'commentReaction'>
export type CommentReactionUpdate = TablesUpdate<'commentReaction'>

export type CommentReactionDb = Pick<
  CommentReactionRow,
  'commReactId' | 'reactionAuthorId' | 'reactedComment' | 'reactionType'
>

export interface CommentReactionDto {
  id: string
  authorId?: string
  commentId?: string
  reactionType?: ReactionType
}

export const COMMENT_REACTION_SAFE_SELECT =
  'commReactId, reactionAuthorId, reactedComment, reactionType' as const

export function toCommentReactionDto(row: CommentReactionDb): CommentReactionDto {
  return {
    id: row.commReactId,
    authorId: toOptionalString(row.reactionAuthorId),
    commentId: toOptionalString(row.reactedComment),
    reactionType: row.reactionType ?? undefined,
  }
}

// Chat message
export type ChatMessageRow = Tables<'ChatMessage'>
export type ChatMessageInsert = TablesInsert<'ChatMessage'>
export type ChatMessageUpdate = TablesUpdate<'ChatMessage'>

export type ChatMessageDb = Pick<
  ChatMessageRow,
  | 'chatId'
  | 'created_at'
  | 'from'
  | 'to'
  | 'text'
  | 'extraContent'
  | 'messageType'
  | 'reaction'
>

export interface ChatMessageDto {
  id: string
  createdAt?: Date
  from?: string
  to?: string
  text?: string
  extraContent?: string
  messageType?: PostType
  reaction?: ReactionType
}

export const CHAT_MESSAGE_SAFE_SELECT =
  'chatId, created_at, from, to, text, extraContent, messageType, reaction' as const

export function toChatMessageDto(row: ChatMessageDb): ChatMessageDto {
  return {
    id: row.chatId,
    createdAt: toDate(row.created_at),
    from: toOptionalString(row.from),
    to: toOptionalString(row.to),
    text: toOptionalString(row.text),
    extraContent: toOptionalString(row.extraContent),
    messageType: row.messageType ?? undefined,
    reaction: row.reaction ?? undefined,
  }
}

export type FriendshipRow = Tables<'friendships'>
export type FriendshipInsert = TablesInsert<'friendships'>
export type FriendshipUpdate = TablesUpdate<'friendships'>

export type FriendshipDb = Pick<FriendshipRow, 'user_a' | 'user_b'>

export interface FriendshipDto {
  userA: string
  userB: string
}

export const FRIENDSHIP_SAFE_SELECT = 'user_a, user_b' as const

export function toFriendshipDto(row: FriendshipDb): FriendshipDto {
  return {
    userA: row.user_a,
    userB: row.user_b,
  }
}

// Notifications
export type NotificationRow = Tables<'notifications'>
export type NotificationInsert = TablesInsert<'notifications'>
export type NotificationUpdate = TablesUpdate<'notifications'>

export type NotificationDb = Pick<
  NotificationRow,
  'notificationId' | 'created_at' | 'activity_from' | 'to' | 'generatedNavigation' | 'notificationType' | 'seen'
>

export interface NotificationDto {
  id: string
  createdAt?: Date
  activityFrom?: string
  to?: string
  generatedNavigation?: string
  notificationType?: NotificationType
  seen: boolean
}

export const NOTIFICATION_SAFE_SELECT =
  'notificationId, created_at, activity_from, to, generatedNavigation, notificationType, seen' as const

export function toNotificationDto(row: NotificationDb): NotificationDto {
  return {
    id: row.notificationId,
    createdAt: toDate(row.created_at),
    activityFrom: toOptionalString(row.activity_from),
    to: toOptionalString(row.to),
    generatedNavigation: toOptionalString(row.generatedNavigation),
    notificationType: row.notificationType ?? undefined,
    seen: toBoolean(row.seen),
  }
}

export type RegistrationCodeRow = Tables<'registrationcodes'>
export type RegistrationCodeInsert = TablesInsert<'registrationcodes'>
export type RegistrationCodeUpdate = TablesUpdate<'registrationcodes'>

export type RegistrationCodeDb = Pick<
  RegistrationCodeRow,
  'id' | 'created_at' | 'code' | 'profile'
>

export interface RegistrationCodeDto {
  id: number
  createdAt?: Date
  code?: string
  profile?: string
}

export const REGISTRATION_CODE_SAFE_SELECT =
  'id, created_at, code, profile' as const

export function toRegistrationCodeDto(row: RegistrationCodeDb): RegistrationCodeDto {
  return {
    id: row.id,
    createdAt: toDate(row.created_at),
    code: toOptionalString(row.code),
    profile: toOptionalString(row.profile),
  }
}

// Bot
export type BotRow = Tables<'bots'>
export type BotInsert = TablesInsert<'bots'>
export type BotUpdate = TablesUpdate<'bots'>

export type BotDb = Pick<BotRow, 'id' | 'username' | 'profileId' | 'is_active' | 'created_at'>

export interface BotDto {
  id: string
  username: string
  profileId?: string
  isActive: boolean
  createdAt?: Date
}

export const BOT_SAFE_SELECT = 'id, username, profileId, is_active, created_at' as const

export function toBotDto(row: BotDb): BotDto {
  return {
    id: row.id,
    username: row.username,
    profileId: toOptionalString(row.profileId),
    isActive: toBoolean(row.is_active),
    createdAt: toDate(row.created_at),
  }
}

// Short aliases for common usage
export type Profile = ProfileDto
export type Post = PostDto
export type Comment = CommentDto
export type CommentReply = CommentReplyDto
export type ChatMessage = ChatMessageDto
export type PostReaction = PostReactionDto
export type CommentReaction = CommentReactionDto
export type Friendship = FriendshipDto
export type Notification = NotificationDto
export type RegistrationCode = RegistrationCodeDto
export type Bot = BotDto

// Registration
export interface ProfileRegistrationDTO {
  email: string
  username: string
  avatarUrl: string
  bannerUrl: string
  bio: string
  confirmedAccount: boolean
}
