/**
 * Dexie Database Hooks
 * Custom React hooks for database operations
 */

'use client'

import { useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  db,
  IProfile,
  IPageProfile,
  IPost,
  IImagePost,
  IVideoPost,
  IMarketplacePost,
  IPostComment,
  IPostCommentReply,
  IReaction,
  IChat,
  IGroupChat,
  IChatMessage,
  IChatLink,
} from '@/lib/db'

/**
 * Hook: useProfiles
 * Get all profiles from database
 */
export function useProfiles() {
  const profiles = useLiveQuery(() => db.profiles.bulkGet, [])
  return profiles
}

export function useFirst15Profiles() {
  return useLiveQuery(() => db.profiles.limit(15).toArray(), []);
}


/**
 * Hook: useProfile
 * Get a single profile by ID
 */
export function useProfile(id: string) {
  const profile = useLiveQuery(() => db.profiles.get(id), [id])
  return profile
}

export function useTryGetUserProfile() {
  const userProfile = useLiveQuery(() => db.userProfile.get(0), [0])
  return userProfile
}

/**
 * Hook: useProfileByUsername
 * Get profile by username
 */
export function useProfileByUsername(username: string) {
  const profile = useLiveQuery(
    () => db.profiles.where('username').equals(username).first(),
    [username]
  )
  return profile
}

/**
 * Hook: useAddProfile
 * Add a new profile
 */
export function useAddProfile() {
  return useCallback(async (profile: IProfile) => {
    try {
      const id = await db.profiles.add(profile)
      return { success: true, id }
    } catch (error) {
      console.error('Error adding profile:', error)
      return { success: false, error }
    }
  }, [])
}

// /**
//  * Hook: useUpdateProfile
//  * Update an existing profile
//  */
// export function useUpdateProfile() {
//   return useCallback(async (id: number, changes: Partial<IProfile>) => {
//     try {
//       await db.profiles.update(id, changes)
//       return { success: true }
//     } catch (error) {
//       console.error('Error updating profile:', error)
//       return { success: false, error }
//     }
//   }, [])
// }

/**
 * Hook: useDeleteProfile
 * Delete a profile
 */
export function useDeleteProfile() {
  return useCallback(async (id: number) => {
    try {
      await db.profiles.delete(id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting profile:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: usePosts
 * Get all posts
 */
export function usePosts() {
  const posts = useLiveQuery(() => db.posts.toArray(), [])
  return posts
}

/**
 * Hook: usePost
 * Get a single post by ID
 */
export function usePost(id: number) {
  const post = useLiveQuery(() => db.posts.get(id), [id])
  return post
}

/**
 * Hook: usePostsByAuthor
 * Get all posts by a specific author
 */
export function usePostsByAuthor(authorId: string) {
  const posts = useLiveQuery(
    () => db.posts.where('authorId').equals(authorId).toArray(),
    [authorId]
  )
  return posts
}


export function usePostCommentRepliesByPostCommentId(postCommentId: string) {
  const replies = useLiveQuery<IPostCommentReply[]>(
    () => db.replies
      .where('postCommentId')
      .equals(postCommentId)
      .toArray(),
    [postCommentId]
  );

  return replies;
}


export function useProfileByPost(postId: string) {
  return useLiveQuery(
    () => db.profiles.where("postIds").equals(postId).first(),
    [postId]
  );
}

export function useProfileById(profileId: string | undefined) {
  return useLiveQuery(
    () => {
      if (!profileId) return undefined;
      return db.profiles.get(profileId);
    },
    [profileId]
  );
}

/**
 * Hook: useAddPost
 * Add a new post
 */
export function useAddPost() {
  return useCallback(async (post: IPost) => {
    try {
      const id = await db.posts.add(post)
      return { success: true, id }
    } catch (error) {
      console.error('Error adding post:', error)
      return { success: false, error }
    }
  }, [])
}

/**
//  * Hook: useUpdatePost
//  * Update an existing post
//  */
// export function useUpdatePost() {
//   return useCallback(async (id: number, changes: Partial<IPost>) => {
//     try {
//       await db.posts.update(id, changes)
//       return { success: true }
//     } catch (error) {
//       console.error('Error updating post:', error)
//       return { success: false, error }
//     }
//   }, [])
// }

/**
 * Hook: useDeletePost
 * Delete a post
 */
export function useDeletePost() {
  return useCallback(async (id: number) => {
    try {
      await db.posts.delete(id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting post:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useComments
 * Get all comments for a post
 */
export function useComments(postId: number) {
  const comments = useLiveQuery(
    () => db.comments.where('postId').equals(postId).toArray(),
    [postId]
  )
  return comments
}

/**
 * Hook: useComment
 * Get a single comment by ID
 */
export function useComment(id: number) {
  const comment = useLiveQuery(() => db.comments.get(id), [id])
  return comment
}

/**
 * Hook: useAddComment
 * Add a new comment
 */
export function useAddComment() {
  return useCallback(async (comment: IPostComment) => {
    try {
      const id = await db.comments.add(comment)
      return { success: true, id }
    } catch (error) {
      console.error('Error adding comment:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useUpdateComment
 * Update an existing comment
 */
export function useUpdateComment() {
  return useCallback(async (id: number, changes: Partial<IPostComment>) => {
    try {
      await db.comments.update(id, changes)
      return { success: true }
    } catch (error) {
      console.error('Error updating comment:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useDeleteComment
 * Delete a comment
 */
export function useDeleteComment() {
  return useCallback(async (id: number) => {
    try {
      await db.comments.delete(id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting comment:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useReplies
 * Get all replies for a comment
 */
export function useReplies(commentId: number) {
  const replies = useLiveQuery(
    () => db.replies.where('commentId').equals(commentId).toArray(),
    [commentId]
  )
  return replies
}

/**
 * Hook: useReply
 * Get a single reply by ID
 */
export function useReply(id: number) {
  const reply = useLiveQuery(() => db.replies.get(id), [id])
  return reply
}

/**
 * Hook: useAddReply
 * Add a new reply
 */
export function useAddReply() {
  return useCallback(async (reply: IPostCommentReply) => {
    try {
      const id = await db.replies.add(reply)
      return { success: true, id }
    } catch (error) {
      console.error('Error adding reply:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useUpdateReply
 * Update an existing reply
 */
export function useUpdateReply() {
  return useCallback(async (id: number, changes: Partial<IPostCommentReply>) => {
    try {
      await db.replies.update(id, changes)
      return { success: true }
    } catch (error) {
      console.error('Error updating reply:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useDeleteReply
 * Delete a reply
 */
export function useDeleteReply() {
  return useCallback(async (id: number) => {
    try {
      await db.replies.delete(id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting reply:', error)
      return { success: false, error }
    }
  }, [])
}




/**
 * Hook: useClearAllData
 * Clear all data from the database (useful for testing)
 */
export function useClearAllData() {
  return useCallback(async () => {
    try {
      await db.delete()
      await db.open()
      return { success: true }
    } catch (error) {
      console.error('Error clearing database:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useChats
 * Get all chats for a user
 */
export function useChats() {
  const chats = useLiveQuery(() => db.chats.toArray(), [])
  return chats
}

/**
 * Hook: useChat
 * Get a single chat by ID
 */
export function useChat(id: number) {
  const chat = useLiveQuery(() => db.chats.get(id), [id])
  return chat
}

/**
 * Hook: useChatsBetween
 * Get chats between two profiles
 */
export function useChatsBetween(fromId: number, toId: number) {
  const chats = useLiveQuery(
    () =>
      db.chats
        .where('fromProfileId')
        .equals(fromId)
        .and((c) => c.toProfileId === toId)
        .toArray(),
    [fromId, toId]
  )
  return chats
}

/**
 * Hook: useAddChat
 * Create a new chat
 */
export function useAddChat() {
  return useCallback(async (chat: IChat) => {
    try {
      const id = await db.chats.add(chat)
      return { success: true, id }
    } catch (error) {
      console.error('Error adding chat:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useUpdateChat
 * Update an existing chat
 */
export function useUpdateChat() {
  return useCallback(async (id: number, changes: Partial<IChat>) => {
    try {
      await db.chats.update(id, changes)
      return { success: true }
    } catch (error) {
      console.error('Error updating chat:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useDeleteChat
 * Delete a chat
 */
export function useDeleteChat() {
  return useCallback(async (id: number) => {
    try {
      await db.chats.delete(id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting chat:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useGroupChats
 * Get all group chats
 */
export function useGroupChats() {
  const groupChats = useLiveQuery(() => db.groupChats.toArray(), [])
  return groupChats
}

/**
 * Hook: useGroupChat
 * Get a single group chat by ID
 */
export function useGroupChat(id: number) {
  const groupChat = useLiveQuery(() => db.groupChats.get(id), [id])
  return groupChat
}

/**
 * Hook: useGroupChatsByMember
 * Get all group chats a user is a member of
 */
export function useGroupChatsByMember(memberId: number) {
  const groupChats = useLiveQuery(
    () =>
      db.groupChats
        .filter((gc) => gc.memberIds.includes(memberId))
        .toArray(),
    [memberId]
  )
  return groupChats
}

/**
 * Hook: useAddGroupChat
 * Create a new group chat
 */
export function useAddGroupChat() {
  return useCallback(async (groupChat: IGroupChat) => {
    try {
      const id = await db.groupChats.add(groupChat)
      return { success: true, id }
    } catch (error) {
      console.error('Error adding group chat:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useUpdateGroupChat
 * Update an existing group chat
 */
export function useUpdateGroupChat() {
  return useCallback(async (id: number, changes: Partial<IGroupChat>) => {
    try {
      await db.groupChats.update(id, changes)
      return { success: true }
    } catch (error) {
      console.error('Error updating group chat:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useDeleteGroupChat
 * Delete a group chat
 */
export function useDeleteGroupChat() {
  return useCallback(async (id: number) => {
    try {
      await db.groupChats.delete(id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting group chat:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useMessages
 * Get all messages in a chat
 */
export function useMessages(chatId: number) {
  const messages = useLiveQuery(
    () =>
      db.messages
        .where('chatId')
        .equals(chatId)
        .toArray(),
    [chatId]
  )
  return messages
}

/**
 * Hook: useMessage
 * Get a single message by ID
 */
export function useMessage(id: number) {
  const message = useLiveQuery(() => db.messages.get(id), [id])
  return message
}

/**
 * Hook: useMessagesBySender
 * Get all messages from a specific sender
 */
export function useMessagesBySender(senderId: number) {
  const messages = useLiveQuery(
    () => db.messages.where('senderId').equals(senderId).toArray(),
    [senderId]
  )
  return messages
}

/**
 * Hook: useAddMessage
 * Add a new message
 */
export function useAddMessage() {
  return useCallback(async (message: IChatMessage) => {
    try {
      const id = await db.messages.add(message)
      return { success: true, id }
    } catch (error) {
      console.error('Error adding message:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useUpdateMessage
 * Update an existing message
 */
export function useUpdateMessage() {
  return useCallback(async (id: number, changes: Partial<IChatMessage>) => {
    try {
      await db.messages.update(id, changes)
      return { success: true }
    } catch (error) {
      console.error('Error updating message:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useDeleteMessage
 * Delete a message
 */
export function useDeleteMessage() {
  return useCallback(async (id: number) => {
    try {
      await db.messages.delete(id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting message:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useChatLinks
 * Get all chat links in a chat
 */
export function useChatLinks(chatId: number) {
  const links = useLiveQuery(
    () =>
      db.chatLinks
        .where('chatId')
        .equals(chatId)
        .toArray(),
    [chatId]
  )
  return links
}

/**
 * Hook: useChatLink
 * Get a single chat link by ID
 */
export function useChatLink(id: number) {
  const link = useLiveQuery(() => db.chatLinks.get(id), [id])
  return link
}

/**
 * Hook: useAddChatLink
 * Add a new chat link (message with link metadata)
 */
export function useAddChatLink() {
  return useCallback(async (chatLink: IChatLink) => {
    try {
      const id = await db.chatLinks.add(chatLink)
      return { success: true, id }
    } catch (error) {
      console.error('Error adding chat link:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useUpdateChatLink
 * Update an existing chat link
 */
export function useUpdateChatLink() {
  return useCallback(async (id: number, changes: Partial<IChatLink>) => {
    try {
      await db.chatLinks.update(id, changes)
      return { success: true }
    } catch (error) {
      console.error('Error updating chat link:', error)
      return { success: false, error }
    }
  }, [])
}

/**
 * Hook: useDeleteChatLink
 * Delete a chat link
 */
export function useDeleteChatLink() {
  return useCallback(async (id: number) => {
    try {
      await db.chatLinks.delete(id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting chat link:', error)
      return { success: false, error }
    }
  }, [])
}
