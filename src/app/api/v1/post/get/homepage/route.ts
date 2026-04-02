import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { loadUnreadNotificationDtosForProfile } from "@/lib/services/notifications/loadUnreadNotificationDtos";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { FriendshipsRow } from "@/types/db.generated";
import {
  FEED_SHARED_POST_SELECT,
  FEED_POST_SELECT,
  PROFILE_METADATA_SELECT,
  collectReplyAuthorIds,
  collectSharedPostIds,
  mapFeedPostsToPostData,
  type FeedAuthor,
  type FeedPost,
  type FeedSharedPost,
} from "@/app/api/v1/post/get/feedDto";

type FriendshipPair = Pick<FriendshipsRow, "user_a" | "user_b">;

async function loadReplyAuthorsById(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  posts: FeedPost[]
): Promise<
  | { ok: true; replyAuthorsById: Map<string, FeedAuthor> }
  | { ok: false; response: NextResponse }
> {
  const replyAuthorIds = collectReplyAuthorIds(posts);
  if (replyAuthorIds.length === 0) {
    return { ok: true, replyAuthorsById: new Map<string, FeedAuthor>() };
  }

  const { data: replyAuthors, error: replyAuthorsError } = await supabase
    .from("Profile")
    .select(PROFILE_METADATA_SELECT)
    .in("id", replyAuthorIds);

  if (replyAuthorsError) {
    console.error("Errore recupero autori reply in homepage feed:", replyAuthorsError);
    return {
      ok: false,
      response: NextResponse.json(
        { code: "REPLY_AUTHORS_FETCH_ERROR", error: "Errore interno" },
        { status: 500 }
      ),
    };
  }

  const replyAuthorsById = new Map<string, FeedAuthor>();
  for (const author of (replyAuthors ?? []) as FeedAuthor[]) {
    if (typeof author.id === "string" && author.id.trim().length > 0) {
      replyAuthorsById.set(author.id, author);
    }
  }

  return { ok: true, replyAuthorsById };
}

async function loadSharedPostsById(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  posts: FeedPost[]
): Promise<
  | { ok: true; sharedPostsById: Map<string, FeedSharedPost> }
  | { ok: false; response: NextResponse }
> {
  const sharedPostIds = collectSharedPostIds(posts);
  if (sharedPostIds.length === 0) {
    return { ok: true, sharedPostsById: new Map<string, FeedSharedPost>() };
  }

  const { data: sharedPosts, error: sharedPostsError } = await supabase
    .from("post")
    .select(FEED_SHARED_POST_SELECT)
    .in("id", sharedPostIds);

  if (sharedPostsError) {
    console.error("Errore recupero subpost condivisi in homepage feed:", sharedPostsError);
    return {
      ok: false,
      response: NextResponse.json(
        { code: "SHARED_POSTS_FETCH_ERROR", error: "Errore interno" },
        { status: 500 }
      ),
    };
  }

  const sharedPostsById = new Map<string, FeedSharedPost>();
  for (const sharedPost of (sharedPosts ?? []) as FeedSharedPost[]) {
    if (typeof sharedPost.id === "string" && sharedPost.id.trim().length > 0) {
      sharedPostsById.set(sharedPost.id, sharedPost);
    }
  }

  return { ok: true, sharedPostsById };
}

export async function GET(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  const auth = await resolveAuthenticatedProfileIdFromRequest(req, supabase);

  if (!auth.ok) {
    if (auth.code === "SESSION_REQUIRED") {
      return NextResponse.json(
        { code: "SESSION_REQUIRED", error: "Sessione mancante" },
        { status: 401 }
      );
    }

    if (auth.code === "INVALID_SESSION") {
      const res = NextResponse.json(
        { code: "INVALID_SESSION", error: "Sessione non valida" },
        { status: 401 }
      );
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    if (auth.code === "INVALID_SESSION_IDENTITY") {
      return NextResponse.json(
        { code: "INVALID_SESSION_IDENTITY", error: "Sessione non valida" },
        { status: 401 }
      );
    }

    if (auth.code === "PROFILE_RESOLUTION_ERROR") {
      console.error("Errore risoluzione profilo in homepage feed:", auth.error);
      return NextResponse.json(
        { code: "PROFILE_RESOLUTION_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { code: "PROFILE_NOT_FOUND", error: "Profilo non trovato" },
      { status: 404 }
    );
  }

  const { data: friendships, error: friendshipsError } = await supabase
    .from("friendships")
    .select("user_a, user_b")
    .or(`user_a.eq.${auth.profileId},user_b.eq.${auth.profileId}`);

  if (friendshipsError) {
    console.error("Errore recupero amicizie homepage:", friendshipsError);
    return NextResponse.json(
      { code: "FRIENDSHIPS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const authorIds = new Set<string>([auth.profileId]);

  for (const friendship of (friendships ?? []) as FriendshipPair[]) {
    if (friendship.user_a === auth.profileId) {
      authorIds.add(friendship.user_b);
      continue;
    }

    if (friendship.user_b === auth.profileId) {
      authorIds.add(friendship.user_a);
    }
  }

  const authorIdsList = Array.from(authorIds);

  const { data: feedRows, error: feedError } = await supabase
    .from("post")
    .select(FEED_POST_SELECT)
    .in("authorId", authorIdsList)
    .order("created_at", { ascending: false })
    .limit(20);

  if (feedError) {
    console.error("Errore recupero feed homepage:", feedError);
    return NextResponse.json(
      { code: "POSTS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const feedPosts = (feedRows ?? []) as FeedPost[];

  const replyAuthorsResult = await loadReplyAuthorsById(supabase, feedPosts);
  if (!replyAuthorsResult.ok) {
    return replyAuthorsResult.response;
  }

  const sharedPostsResult = await loadSharedPostsById(supabase, feedPosts);
  if (!sharedPostsResult.ok) {
    return sharedPostsResult.response;
  }

  const posts = mapFeedPostsToPostData(
    feedPosts,
    replyAuthorsResult.replyAuthorsById,
    sharedPostsResult.sharedPostsById
  );

  const unreadNotificationsResult = await loadUnreadNotificationDtosForProfile({
    profileId: auth.profileId,
    supabase,
    limit: 100,
  });

  if (!unreadNotificationsResult.ok) {
    console.error(
      "Errore recupero notifiche non viste homepage:",
      unreadNotificationsResult.error
    );
    return NextResponse.json(
      { code: "UNREAD_NOTIFICATIONS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    posts,
    unreadNotifications: unreadNotificationsResult.notifications,
  });
}
