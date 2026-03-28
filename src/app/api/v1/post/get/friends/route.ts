import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import {
  FEED_POST_SELECT,
  PROFILE_METADATA_SELECT,
  collectReplyAuthorIds,
  mapFeedPostsToPostData,
  type FeedAuthor,
  type FeedPost,
} from "@/app/api/v1/post/get/feedDto";

export interface GetFriendPostRequest {
  friendId: string;
  alreadyGotPosts: string[];
}

function normalizeExcludedPostIds(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );
}

function toPostgrestInFilter(values: string[]): string {
  const encodedValues = values.map((value) => `'${value.replace(/'/g, "''")}'`);
  return `(${encodedValues.join(",")})`;
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

  const responseArray = mapFeedPostsToPostData(
    feedPosts,
    replyAuthorsResult.replyAuthorsById
  );

  return NextResponse.json(responseArray);
}
