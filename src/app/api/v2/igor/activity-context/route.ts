import 'server-only'
import { NextRequest, NextResponse } from 'next/server'

import { igorUnauthorized, verifyIgorToken } from '@/lib/Security/IgorAuth'
import { VercelLogger } from '@/lib/logging/VercelLogger'
import { createSupabaseAdminClient } from '@/lib/supabase/serverAdminClient'
import type { Database, Tables } from '@/types/database.types'

type TargetType =
  | 'post'
  | 'postComment'
  | 'react to post'
  | 'react to comment'
  | 'reply to comment'
  | 'react to comment reply'
  | 'react to post comment reply'

type ReactionType = Database['public']['Enums']['ReactionType']

type ProfileContextRow = Pick<
  Tables<'Profile'>,
  | 'id'
  | 'username'
  | 'avatarUrl'
  | 'bannerUrl'
  | 'bio'
  | 'confirmedAccount'
  | 'created_at'
  | 'updated_at'
  | 'dataDiNascita'
  | 'giocattoloPreferito'
  | 'locationId'
  | 'tipoCuccia'
>

type PostContextRow = Pick<
  Tables<'post'>,
  'id' | 'authorId' | 'content' | 'extraContent' | 'mediaUrl' | 'postType' | 'created_at'
>

type CommentContextRow = Pick<
  Tables<'comment'>,
  'commentId' | 'commentAuthorId' | 'postid' | 'commentText' | 'extraContent' | 'created_at'
>

type CommentReplyContextRow = Pick<
  Tables<'commentReply'>,
  | 'commentReplyId'
  | 'commentReplyAuthorId'
  | 'repliedComment'
  | 'text'
  | 'mediaUrl'
  | 'extraContent'
  | 'created_at'
>

type PostReactionContextRow = Pick<
  Tables<'postReaction'>,
  'id' | 'reactedBy' | 'reactedPost' | 'reactionType' | 'created_at'
>

type CommentReactionContextRow = Pick<
  Tables<'commentReaction'>,
  'commReactId' | 'reactionAuthorId' | 'reactedComment' | 'reactionType' | 'created_at'
>

type CommentReplyReactionContextRow = Pick<
  Tables<'CommentReplyReaction'>,
  | 'CommentReplyReactionId'
  | 'commentReplyReactionAuthor'
  | 'commentReplyReacted'
  | 'reactionType'
  | 'created_at'
>

type NotificationContextRow = Pick<
  Tables<'notifications'>,
  'notificationId' | 'created_at' | 'activity_from' | 'to' | 'generatedNavigation' | 'notificationType' | 'seen'
>

interface ProfileContextDto {
  id: string
  username: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  bio: string | null
  confirmedAccount: boolean | null
  createdAt: string | null
  updatedAt: string | null
  dataDiNascita: string | null
  giocattoloPreferito: string | null
  locationId: string | null
  tipoCuccia: string | null
}

interface ProfileMiniDto {
  id: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
}

const PROFILE_CONTEXT_SELECT =
  'id, username, avatarUrl, bannerUrl, bio, confirmedAccount, created_at, updated_at, dataDiNascita, giocattoloPreferito, locationId, tipoCuccia' as const
const POST_CONTEXT_SELECT =
  'id, authorId, content, extraContent, mediaUrl, postType, created_at' as const
const COMMENT_CONTEXT_SELECT =
  'commentId, commentAuthorId, postid, commentText, extraContent, created_at' as const
const COMMENT_REPLY_CONTEXT_SELECT =
  'commentReplyId, commentReplyAuthorId, repliedComment, text, mediaUrl, extraContent, created_at' as const
const POST_REACTION_CONTEXT_SELECT =
  'id, reactedBy, reactedPost, reactionType, created_at' as const
const COMMENT_REACTION_CONTEXT_SELECT =
  'commReactId, reactionAuthorId, reactedComment, reactionType, created_at' as const
const COMMENT_REPLY_REACTION_CONTEXT_SELECT =
  'CommentReplyReactionId, commentReplyReactionAuthor, commentReplyReacted, reactionType, created_at' as const
const NOTIFICATION_CONTEXT_SELECT =
  'notificationId, created_at, activity_from, to, generatedNavigation, notificationType, seen' as const

const TARGET_TYPES = new Set<TargetType>([
  'post',
  'postComment',
  'react to post',
  'react to comment',
  'reply to comment',
  'react to comment reply',
  'react to post comment reply',
])

function normalizeNonEmptyString(value: string | null): string | null {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function parseLimit(value: string | null, fallback: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(max, parsed)
}

function toProfileContextDto(profile: ProfileContextRow): ProfileContextDto {
  return {
    id: profile.id,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    bannerUrl: profile.bannerUrl,
    bio: profile.bio,
    confirmedAccount: profile.confirmedAccount,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    dataDiNascita: profile.dataDiNascita,
    giocattoloPreferito: profile.giocattoloPreferito,
    locationId: profile.locationId,
    tipoCuccia: profile.tipoCuccia,
  }
}

function toProfileMini(profile: ProfileContextRow | null | undefined, fallbackId: string | null): ProfileMiniDto | null {
  if (!profile && !fallbackId) return null

  return {
    id: profile?.id ?? fallbackId ?? '',
    username: profile?.username ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
    bio: profile?.bio ?? null,
  }
}

function collectProfileIds(...groups: Array<Array<string | null | undefined>>): string[] {
  return Array.from(new Set(groups.flat().filter((value): value is string => Boolean(value?.trim()))))
}

async function loadProfilesById(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  profileIds: string[]
): Promise<Map<string, ProfileContextRow>> {
  const profilesById = new Map<string, ProfileContextRow>()
  const ids = Array.from(new Set(profileIds))
  if (ids.length === 0) return profilesById

  const { data, error } = await supabase
    .from('Profile')
    .select(PROFILE_CONTEXT_SELECT)
    .in('id', ids)

  if (error) throw error

  for (const profile of (data ?? []) as ProfileContextRow[]) {
    profilesById.set(profile.id, profile)
  }

  return profilesById
}

function sortByCreatedAtDesc<T extends { created_at: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
}

function toPostContextDto(
  post: PostContextRow | null | undefined,
  profilesById: Map<string, ProfileContextRow>
) {
  if (!post) return null

  return {
    id: post.id,
    authorId: post.authorId,
    author: toProfileMini(profilesById.get(post.authorId), post.authorId),
    content: post.content,
    extraContent: post.extraContent,
    mediaUrl: post.mediaUrl,
    postType: post.postType,
    createdAt: post.created_at,
  }
}

function toCommentContextDto(
  comment: CommentContextRow | null | undefined,
  profilesById: Map<string, ProfileContextRow>
) {
  if (!comment) return null

  return {
    id: comment.commentId,
    authorId: comment.commentAuthorId,
    author: toProfileMini(
      comment.commentAuthorId ? profilesById.get(comment.commentAuthorId) : null,
      comment.commentAuthorId
    ),
    postId: comment.postid,
    text: comment.commentText,
    extraContent: comment.extraContent,
    createdAt: comment.created_at,
  }
}

function summarizeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message }
  }

  return { message: String(error) }
}

export async function GET(req: NextRequest) {
  if (!verifyIgorToken(req)) return igorUnauthorized()

  const targetProfileId = normalizeNonEmptyString(
    req.nextUrl.searchParams.get('targetProfileId') ?? req.nextUrl.searchParams.get('profileId')
  )
  const rawTargetType = normalizeNonEmptyString(req.nextUrl.searchParams.get('targetType'))
  const targetType = rawTargetType && TARGET_TYPES.has(rawTargetType as TargetType)
    ? (rawTargetType as TargetType)
    : null

  if (!targetProfileId) {
    return NextResponse.json(
      { error: 'targetProfileId o profileId e obbligatorio' },
      { status: 400 }
    )
  }

  const postsLimit = parseLimit(req.nextUrl.searchParams.get('postsLimit'), 6, 12)
  const commentsLimit = parseLimit(req.nextUrl.searchParams.get('commentsLimit'), 12, 30)
  const repliesLimit = parseLimit(req.nextUrl.searchParams.get('repliesLimit'), 12, 30)
  const reactionsLimit = parseLimit(req.nextUrl.searchParams.get('reactionsLimit'), 12, 30)
  const notificationsLimit = parseLimit(req.nextUrl.searchParams.get('notificationsLimit'), 8, 20)

  const supabase = createSupabaseAdminClient()

  try {
    const { data: targetProfile, error: profileError } = await supabase
      .from('Profile')
      .select(PROFILE_CONTEXT_SELECT)
      .eq('id', targetProfileId)
      .maybeSingle()

    if (profileError) throw profileError

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Profilo target non trovato' },
        { status: 404 }
      )
    }

    const { data: postRows, error: postsError } = await supabase
      .from('post')
      .select(POST_CONTEXT_SELECT)
      .eq('authorId', targetProfileId)
      .order('created_at', { ascending: false })
      .limit(postsLimit)

    if (postsError) throw postsError

    const ownPosts = (postRows ?? []) as PostContextRow[]
    const ownPostIds = ownPosts.map((post) => post.id)

    const { data: targetPostCommentsRows, error: targetPostCommentsError } =
      ownPostIds.length > 0
        ? await supabase
            .from('comment')
            .select(COMMENT_CONTEXT_SELECT)
            .in('postid', ownPostIds)
            .order('created_at', { ascending: false })
            .limit(commentsLimit)
        : { data: [], error: null }

    if (targetPostCommentsError) throw targetPostCommentsError

    const targetPostComments = (targetPostCommentsRows ?? []) as CommentContextRow[]
    const targetPostCommentIds = targetPostComments.map((comment) => comment.commentId)

    const { data: targetPostReplyRows, error: targetPostRepliesError } =
      targetPostCommentIds.length > 0
        ? await supabase
            .from('commentReply')
            .select(COMMENT_REPLY_CONTEXT_SELECT)
            .in('repliedComment', targetPostCommentIds)
            .order('created_at', { ascending: false })
            .limit(repliesLimit)
        : { data: [], error: null }

    if (targetPostRepliesError) throw targetPostRepliesError

    const { data: targetPostReactionRows, error: targetPostReactionsError } =
      ownPostIds.length > 0
        ? await supabase
            .from('postReaction')
            .select(POST_REACTION_CONTEXT_SELECT)
            .in('reactedPost', ownPostIds)
            .order('created_at', { ascending: false })
            .limit(reactionsLimit)
        : { data: [], error: null }

    if (targetPostReactionsError) throw targetPostReactionsError

    const { data: authoredCommentRows, error: authoredCommentsError } = await supabase
      .from('comment')
      .select(COMMENT_CONTEXT_SELECT)
      .eq('commentAuthorId', targetProfileId)
      .order('created_at', { ascending: false })
      .limit(commentsLimit)

    if (authoredCommentsError) throw authoredCommentsError

    const { data: authoredReplyRows, error: authoredRepliesError } = await supabase
      .from('commentReply')
      .select(COMMENT_REPLY_CONTEXT_SELECT)
      .eq('commentReplyAuthorId', targetProfileId)
      .order('created_at', { ascending: false })
      .limit(repliesLimit)

    if (authoredRepliesError) throw authoredRepliesError

    const { data: authoredPostReactionRows, error: authoredPostReactionsError } = await supabase
      .from('postReaction')
      .select(POST_REACTION_CONTEXT_SELECT)
      .eq('reactedBy', targetProfileId)
      .order('created_at', { ascending: false })
      .limit(reactionsLimit)

    if (authoredPostReactionsError) throw authoredPostReactionsError

    const { data: authoredCommentReactionRows, error: authoredCommentReactionsError } = await supabase
      .from('commentReaction')
      .select(COMMENT_REACTION_CONTEXT_SELECT)
      .eq('reactionAuthorId', targetProfileId)
      .order('created_at', { ascending: false })
      .limit(reactionsLimit)

    if (authoredCommentReactionsError) throw authoredCommentReactionsError

    const { data: authoredReplyReactionRows, error: authoredReplyReactionsError } = await supabase
      .from('CommentReplyReaction')
      .select(COMMENT_REPLY_REACTION_CONTEXT_SELECT)
      .eq('commentReplyReactionAuthor', targetProfileId)
      .order('created_at', { ascending: false })
      .limit(reactionsLimit)

    if (authoredReplyReactionsError) throw authoredReplyReactionsError

    const { data: notificationRows, error: notificationsError } = await supabase
      .from('notifications')
      .select(NOTIFICATION_CONTEXT_SELECT)
      .or(`to.eq.${targetProfileId},activity_from.eq.${targetProfileId}`)
      .order('created_at', { ascending: false })
      .limit(notificationsLimit)

    if (notificationsError) throw notificationsError

    const targetPostReplies = (targetPostReplyRows ?? []) as CommentReplyContextRow[]
    const targetPostReactions = (targetPostReactionRows ?? []) as PostReactionContextRow[]
    const authoredComments = (authoredCommentRows ?? []) as CommentContextRow[]
    const authoredReplies = (authoredReplyRows ?? []) as CommentReplyContextRow[]
    const authoredPostReactions = (authoredPostReactionRows ?? []) as PostReactionContextRow[]
    const authoredCommentReactions = (authoredCommentReactionRows ?? []) as CommentReactionContextRow[]
    const authoredReplyReactions = (authoredReplyReactionRows ?? []) as CommentReplyReactionContextRow[]
    const notifications = (notificationRows ?? []) as NotificationContextRow[]

    const authoredReplyParentCommentIds = Array.from(
      new Set(
        authoredReplies
          .map((reply) => reply.repliedComment)
          .filter((commentId): commentId is string => Boolean(commentId))
      )
    )

    const { data: authoredReplyParentCommentRows, error: authoredReplyParentCommentsError } =
      authoredReplyParentCommentIds.length > 0
        ? await supabase
            .from('comment')
            .select(COMMENT_CONTEXT_SELECT)
            .in('commentId', authoredReplyParentCommentIds)
        : { data: [], error: null }

    if (authoredReplyParentCommentsError) throw authoredReplyParentCommentsError

    const authoredReplyParentComments = (authoredReplyParentCommentRows ?? []) as CommentContextRow[]
    const parentCommentsById = new Map<string, CommentContextRow>(
      authoredReplyParentComments.map((comment) => [comment.commentId, comment])
    )

    const parentPostIds = Array.from(
      new Set(
        [
          ...authoredComments.map((comment) => comment.postid),
          ...authoredReplyParentComments.map((comment) => comment.postid),
        ].filter((postId): postId is string => Boolean(postId))
      )
    )

    const { data: parentPostRows, error: parentPostsError } =
      parentPostIds.length > 0
        ? await supabase
            .from('post')
            .select(POST_CONTEXT_SELECT)
            .in('id', parentPostIds)
        : { data: [], error: null }

    if (parentPostsError) throw parentPostsError

    const parentPosts = (parentPostRows ?? []) as PostContextRow[]
    const parentPostsById = new Map<string, PostContextRow>(
      parentPosts.map((post) => [post.id, post])
    )

    const profilesById = await loadProfilesById(
      supabase,
      collectProfileIds(
        [targetProfileId],
        targetPostComments.map((comment) => comment.commentAuthorId),
        targetPostReplies.map((reply) => reply.commentReplyAuthorId),
        targetPostReactions.map((reaction) => reaction.reactedBy),
        authoredReplyParentComments.map((comment) => comment.commentAuthorId),
        parentPosts.map((post) => post.authorId),
        notifications.flatMap((notification) => [notification.activity_from, notification.to])
      )
    )

    const targetPostCommentsByPostId = new Map<string, CommentContextRow[]>()
    for (const comment of targetPostComments) {
      const postId = comment.postid
      if (!postId) continue
      const comments = targetPostCommentsByPostId.get(postId) ?? []
      comments.push(comment)
      targetPostCommentsByPostId.set(postId, comments)
    }

    const targetPostRepliesByCommentId = new Map<string, CommentReplyContextRow[]>()
    for (const reply of targetPostReplies) {
      const commentId = reply.repliedComment
      if (!commentId) continue
      const replies = targetPostRepliesByCommentId.get(commentId) ?? []
      replies.push(reply)
      targetPostRepliesByCommentId.set(commentId, replies)
    }

    const targetPostReactionsByPostId = new Map<string, PostReactionContextRow[]>()
    for (const reaction of targetPostReactions) {
      const postId = reaction.reactedPost
      if (!postId) continue
      const reactions = targetPostReactionsByPostId.get(postId) ?? []
      reactions.push(reaction)
      targetPostReactionsByPostId.set(postId, reactions)
    }

    const response = {
      targetType,
      targetProfileId,
      targetProfile: toProfileContextDto(targetProfile as ProfileContextRow),
      latestOwnPosts: ownPosts.map((post) => ({
        id: post.id,
        authorId: post.authorId,
        author: toProfileMini(profilesById.get(post.authorId), post.authorId),
        content: post.content,
        extraContent: post.extraContent,
        mediaUrl: post.mediaUrl,
        postType: post.postType,
        createdAt: post.created_at,
        comments: sortByCreatedAtDesc(targetPostCommentsByPostId.get(post.id) ?? []).map((comment) => ({
          id: comment.commentId,
          authorId: comment.commentAuthorId,
          author: toProfileMini(
            comment.commentAuthorId ? profilesById.get(comment.commentAuthorId) : null,
            comment.commentAuthorId
          ),
          text: comment.commentText,
          extraContent: comment.extraContent,
          createdAt: comment.created_at,
          replies: sortByCreatedAtDesc(targetPostRepliesByCommentId.get(comment.commentId) ?? []).map((reply) => ({
            id: reply.commentReplyId,
            authorId: reply.commentReplyAuthorId,
            author: toProfileMini(
              reply.commentReplyAuthorId ? profilesById.get(reply.commentReplyAuthorId) : null,
              reply.commentReplyAuthorId
            ),
            text: reply.text,
            mediaUrl: reply.mediaUrl,
            extraContent: reply.extraContent,
            createdAt: reply.created_at,
          })),
        })),
        reactions: sortByCreatedAtDesc(targetPostReactionsByPostId.get(post.id) ?? []).map((reaction) => ({
          id: String(reaction.id),
          authorId: reaction.reactedBy,
          author: toProfileMini(
            reaction.reactedBy ? profilesById.get(reaction.reactedBy) : null,
            reaction.reactedBy
          ),
          reactionType: reaction.reactionType as ReactionType | null,
          createdAt: reaction.created_at,
        })),
      })),
      recentAuthoredInteractions: {
        comments: authoredComments.map((comment) => ({
          id: comment.commentId,
          postId: comment.postid,
          text: comment.commentText,
          extraContent: comment.extraContent,
          createdAt: comment.created_at,
          parentPost: toPostContextDto(
            comment.postid ? parentPostsById.get(comment.postid) : null,
            profilesById
          ),
        })),
        replies: authoredReplies.map((reply) => ({
          id: reply.commentReplyId,
          repliedCommentId: reply.repliedComment,
          text: reply.text,
          mediaUrl: reply.mediaUrl,
          extraContent: reply.extraContent,
          createdAt: reply.created_at,
          parentComment: toCommentContextDto(
            reply.repliedComment ? parentCommentsById.get(reply.repliedComment) : null,
            profilesById
          ),
          parentPost: toPostContextDto(
            reply.repliedComment
              ? parentPostsById.get(parentCommentsById.get(reply.repliedComment)?.postid ?? '')
              : null,
            profilesById
          ),
        })),
        reactions: [
          ...authoredPostReactions.map((reaction) => ({
            id: String(reaction.id),
            targetKind: 'post' as const,
            targetId: reaction.reactedPost,
            reactionType: reaction.reactionType,
            createdAt: reaction.created_at,
          })),
          ...authoredCommentReactions.map((reaction) => ({
            id: reaction.commReactId,
            targetKind: 'comment' as const,
            targetId: reaction.reactedComment,
            reactionType: reaction.reactionType,
            createdAt: reaction.created_at,
          })),
          ...authoredReplyReactions.map((reaction) => ({
            id: reaction.CommentReplyReactionId,
            targetKind: 'commentReply' as const,
            targetId: reaction.commentReplyReacted,
            reactionType: reaction.reactionType,
            createdAt: reaction.created_at,
          })),
        ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
      },
      recentNotifications: notifications.map((notification) => ({
        id: notification.notificationId,
        createdAt: notification.created_at,
        activityFromId: notification.activity_from,
        activityFrom: toProfileMini(
          notification.activity_from ? profilesById.get(notification.activity_from) : null,
          notification.activity_from
        ),
        toProfileId: notification.to,
        to: toProfileMini(
          notification.to ? profilesById.get(notification.to) : null,
          notification.to
        ),
        generatedNavigation: notification.generatedNavigation,
        notificationType: notification.notificationType,
        seen: notification.seen ?? false,
      })),
      counts: {
        ownPosts: ownPosts.length,
        commentsOnOwnPosts: targetPostComments.length,
        repliesOnOwnPostComments: targetPostReplies.length,
        reactionsOnOwnPosts: targetPostReactions.length,
        authoredComments: authoredComments.length,
        authoredReplies: authoredReplies.length,
        authoredReactions:
          authoredPostReactions.length + authoredCommentReactions.length + authoredReplyReactions.length,
        notifications: notifications.length,
      },
    }

    VercelLogger(
      `[igor/activity-context] ok ${JSON.stringify({
        targetProfileId,
        targetType,
        counts: response.counts,
      })}`
    )

    return NextResponse.json(response)
  } catch (error) {
    VercelLogger(
      `[igor/activity-context] errore ${JSON.stringify({
        targetProfileId,
        targetType,
        error: summarizeError(error),
      })}`
    )

    return NextResponse.json(
      { error: 'Errore recupero contesto target' },
      { status: 500 }
    )
  }
}
