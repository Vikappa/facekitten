import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
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

export interface GetFriendPostRequest {
  friendId: string;
  alreadyGotPosts: string[];
}

const UUID_V4_OR_COMPAT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidLike(value: string): boolean {
  return UUID_V4_OR_COMPAT_PATTERN.test(value);
}

function normalizeExcludedPostIds(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter((value) => value.length > 0 && isUuidLike(value))
    )
  );
}

function toPostgrestInFilter(values: string[]): string {
  // Values are UUID-validated, so they can be sent unquoted in PostgREST `in` filters.
  return `(${values.join(",")})`;
}

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
    console.error("Errore recupero autori reply in feed friend:", replyAuthorsError);
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
    console.error("Errore recupero subpost condivisi in feed friend:", sharedPostsError);
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

export async function POST(req: NextRequest) {
  let payload: GetFriendPostRequest;
  try {
    payload = (await req.json()) as GetFriendPostRequest;
  } catch {
    return NextResponse.json(
      { code: "INVALID_BODY", error: "Body JSON non valido" },
      { status: 400 }
    );
  }

  const friendId =
    typeof payload.friendId === "string" ? payload.friendId.trim() : "";

  if (
    friendId.length === 0 ||
    !Array.isArray(payload.alreadyGotPosts) ||
    !payload.alreadyGotPosts.every((postId) => typeof postId === "string")
  ) {
    return NextResponse.json(
      { code: "INVALID_FRIEND_POST_INPUT", error: "Payload non valido" },
      { status: 400 }
    );
  }

  const alreadyGotPosts = normalizeExcludedPostIds(payload.alreadyGotPosts);

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
      console.error("Errore risoluzione profilo in friend feed:", auth.error);
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

  let postsQuery = supabase
    .from("post")
    .select(FEED_POST_SELECT)
    .eq("authorId", friendId);

  if (alreadyGotPosts.length > 0) {
    postsQuery = postsQuery.not("id", "in", toPostgrestInFilter(alreadyGotPosts));
  }

  const { data: feedRows, error: feedError } = await postsQuery
    .order("created_at", { ascending: false })
    .limit(20);

  if (feedError) {
    console.error("Errore recupero feed friend:", feedError);
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

  const responseArray = mapFeedPostsToPostData(
    feedPosts,
    replyAuthorsResult.replyAuthorsById,
    sharedPostsResult.sharedPostsById
  );

  return NextResponse.json(responseArray);
}
