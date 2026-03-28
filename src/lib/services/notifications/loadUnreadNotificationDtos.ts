import "server-only";

import {
  NotificationData,
  ProfileMetadata,
} from "@/lib/interfaces/CommonInterfaces";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { NotificationsRow, ProfileRow } from "@/types/db.generated";

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

type UnreadNotificationRow = Pick<
  NotificationsRow,
  | "notificationId"
  | "activity_from"
  | "created_at"
  | "generatedNavigation"
  | "notificationType"
  | "seen"
  | "to"
>;

type ActivityProfileRow = Pick<
  ProfileRow,
  | "id"
  | "username"
  | "avatarUrl"
  | "bannerUrl"
  | "bio"
  | "confirmedAccount"
  | "created_at"
  | "updated_at"
  | "dataDiNascita"
  | "giocattoloPreferito"
  | "locationId"
  | "tipoCuccia"
>;

type CommentPreviewRow = {
  commentText: string | null;
  post: { authorId: string | null } | { authorId: string | null }[] | null;
};

type CommentReplyPreviewRow = {
  text: string | null;
  comment:
    | { commentAuthorId: string | null }
    | { commentAuthorId: string | null }[]
    | null;
};

type LoadUnreadNotificationsOptions = {
  profileId: string;
  supabase: SupabaseAdminClient;
  limit?: number;
};

type LoadUnreadNotificationsResult =
  | {
      ok: true;
      notifications: NotificationData[];
    }
  | {
      ok: false;
      error: unknown;
    };

type RelatedEntityIds = {
  relatedPostId: string | null;
  relatedCommentId: string | null;
  relatedCommentReplyId: string | null;
};

const PREVIEW_MAX_LENGTH = 90;
const FRIEND_REQUEST_RECEIVED_PREVIEW_TEXT =
  "ti ha inviato una richiesta di micizia";
const FRIEND_REQUEST_ACCEPTED_PREVIEW_TEXT =
  "ha accettato la tua richiesta di micizia";

function toPreviewSnippet(rawText: string | null | undefined): string | null {
  if (!rawText) {
    return null;
  }

  const normalizedText = rawText.replace(/\s+/g, " ").trim();
  if (normalizedText.length === 0) {
    return null;
  }

  if (normalizedText.length <= PREVIEW_MAX_LENGTH) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, PREVIEW_MAX_LENGTH - 1)}…`;
}

function pickSingleRelationRow<T extends Record<string, unknown>>(
  value: T | T[] | null | undefined
): T | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function sanitizeIdPart(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseRelatedEntityIds(
  generatedNavigation: string | null | undefined
): RelatedEntityIds {
  const emptyResult: RelatedEntityIds = {
    relatedPostId: null,
    relatedCommentId: null,
    relatedCommentReplyId: null,
  };

  if (!generatedNavigation) {
    return emptyResult;
  }

  let url: URL;
  try {
    url = new URL(generatedNavigation, "https://facekitten.local");
  } catch {
    return emptyResult;
  }

  const pathSegments = url.pathname
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => decodePathSegment(segment));

  let relatedPostId = sanitizeIdPart(url.searchParams.get("postId"));
  let relatedCommentId = sanitizeIdPart(url.searchParams.get("commentId"));
  let relatedCommentReplyId = sanitizeIdPart(
    url.searchParams.get("commentReplyId") ?? url.searchParams.get("replyId")
  );

  const postSegmentIndex = pathSegments.findIndex(
    (segment) => segment === "post" || segment === "posts"
  );
  if (!relatedPostId && postSegmentIndex >= 0) {
    relatedPostId = sanitizeIdPart(pathSegments[postSegmentIndex + 1]);
  }

  const commentSegmentIndex = pathSegments.findIndex(
    (segment) => segment === "comment" || segment === "comments"
  );
  if (!relatedCommentId && commentSegmentIndex >= 0) {
    relatedCommentId = sanitizeIdPart(pathSegments[commentSegmentIndex + 1]);
  }

  const replySegmentIndex = pathSegments.findIndex(
    (segment) =>
      segment === "reply" ||
      segment === "replies" ||
      segment === "commentReply" ||
      segment === "commentReplies"
  );
  if (!relatedCommentReplyId && replySegmentIndex >= 0) {
    relatedCommentReplyId = sanitizeIdPart(pathSegments[replySegmentIndex + 1]);
  }

  return {
    relatedPostId,
    relatedCommentId,
    relatedCommentReplyId,
  };
}

function toProfileMetadata(
  profile: ActivityProfileRow | null | undefined,
  fallbackId?: string | null
): ProfileMetadata | null {
  if (!profile && !fallbackId) {
    return null;
  }

  if (!profile) {
    return {
      id: fallbackId ?? "",
      username: "",
      avatarUrl: "",
    };
  }

  return {
    id: profile.id,
    username: profile.username ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    bannerUrl: profile.bannerUrl,
    bio: profile.bio,
    confirmedAccount: profile.confirmedAccount,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    dataDiNascita: profile.dataDiNascita,
    giocattoloPreferito: profile.giocattoloPreferito,
    locationId: profile.locationId,
    tipoCuccia: profile.tipoCuccia,
  };
}

async function resolvePostCommentPreviewText(
  supabase: SupabaseAdminClient,
  profileId: string,
  activityFromId: string,
  createdAt: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("comment")
    .select(
      `
        commentText,
        post:post!comment_postid_fkey (
          authorId
        )
      `
    )
    .eq("commentAuthorId", activityFromId)
    .lte("created_at", createdAt)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Errore risoluzione preview notifica postCommented:", error);
    return null;
  }

  for (const row of (data ?? []) as CommentPreviewRow[]) {
    const postRow = pickSingleRelationRow(row.post);
    if (postRow?.authorId === profileId) {
      return toPreviewSnippet(row.commentText);
    }
  }

  return null;
}

async function resolveCommentReplyPreviewText(
  supabase: SupabaseAdminClient,
  profileId: string,
  activityFromId: string,
  createdAt: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("commentReply")
    .select(
      `
        text,
        comment:comment!commentReply_repliedComment_fkey (
          commentAuthorId
        )
      `
    )
    .eq("commentReplyAuthorId", activityFromId)
    .lte("created_at", createdAt)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Errore risoluzione preview notifica commentReplied:", error);
    return null;
  }

  for (const row of (data ?? []) as CommentReplyPreviewRow[]) {
    const commentRow = pickSingleRelationRow(row.comment);
    if (commentRow?.commentAuthorId === profileId) {
      return toPreviewSnippet(row.text);
    }
  }

  return null;
}

async function resolveNotificationPreviewText(
  notification: UnreadNotificationRow,
  profileId: string,
  supabase: SupabaseAdminClient
): Promise<string | null> {
  const notificationType = notification.notificationType;
  const activityFromId = notification.activity_from;

  if (!activityFromId) {
    return null;
  }

  if (notificationType === "postCommented") {
    return resolvePostCommentPreviewText(
      supabase,
      profileId,
      activityFromId,
      notification.created_at
    );
  }

  if (notificationType === "commentReplied") {
    return resolveCommentReplyPreviewText(
      supabase,
      profileId,
      activityFromId,
      notification.created_at
    );
  }

  if (notificationType === "friendRequestReceived") {
    return FRIEND_REQUEST_RECEIVED_PREVIEW_TEXT;
  }

  if (notificationType === "friendRequestAccepted") {
    return FRIEND_REQUEST_ACCEPTED_PREVIEW_TEXT;
  }

  return null;
}

export async function loadUnreadNotificationDtosForProfile(
  options: LoadUnreadNotificationsOptions
): Promise<LoadUnreadNotificationsResult> {
  const { profileId, supabase, limit = 100 } = options;

  const { data: unreadNotificationRows, error: unreadNotificationsError } = await supabase
    .from("notifications")
    .select(
      "notificationId, activity_from, created_at, generatedNavigation, notificationType, seen, to"
    )
    .eq("to", profileId)
    .or("seen.is.null,seen.eq.false")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (unreadNotificationsError) {
    return { ok: false, error: unreadNotificationsError };
  }

  const notifications = (unreadNotificationRows ?? []) as UnreadNotificationRow[];
  const activityProfileIds = Array.from(
    new Set(
      notifications
        .map((notification) => notification.activity_from)
        .filter((profileIdCandidate): profileIdCandidate is string => !!profileIdCandidate)
    )
  );

  const activityProfileById = new Map<string, ActivityProfileRow>();
  if (activityProfileIds.length > 0) {
    const { data: activityProfiles, error: activityProfilesError } = await supabase
      .from("Profile")
      .select(
        "id, username, avatarUrl, bannerUrl, bio, confirmedAccount, created_at, updated_at, dataDiNascita, giocattoloPreferito, locationId, tipoCuccia"
      )
      .in("id", activityProfileIds);

    if (activityProfilesError) {
      return { ok: false, error: activityProfilesError };
    }

    for (const profile of (activityProfiles ?? []) as ActivityProfileRow[]) {
      activityProfileById.set(profile.id, profile);
    }
  }

  const unreadNotificationDtos = await Promise.all(
    notifications.map(async (notification) => {
      const activityFromProfileRow = notification.activity_from
        ? activityProfileById.get(notification.activity_from)
        : null;
      const activityFromProfile = toProfileMetadata(
        activityFromProfileRow,
        notification.activity_from
      );

      const previewText = await resolveNotificationPreviewText(
        notification,
        profileId,
        supabase
      );

      const relatedEntityIds = parseRelatedEntityIds(
        notification.generatedNavigation ?? null
      );

      return {
        id: notification.notificationId,
        createdAt: notification.created_at,
        generatedNavigation: notification.generatedNavigation ?? null,
        notificationType: notification.notificationType ?? null,
        activityFrom: {
          id: notification.activity_from ?? null,
          name: activityFromProfile?.username.trim() || "Utente",
          avatarUrl: activityFromProfile?.avatarUrl ?? null,
        },
        previewText,
        activityFromProfile,
        activityFromId: notification.activity_from ?? null,
        toProfileId: notification.to ?? null,
        seen: notification.seen ?? null,
        relatedPostId: relatedEntityIds.relatedPostId,
        relatedCommentId: relatedEntityIds.relatedCommentId,
        relatedCommentReplyId: relatedEntityIds.relatedCommentReplyId,
      } satisfies NotificationData;
    })
  );

  return {
    ok: true,
    notifications: unreadNotificationDtos,
  };
}
