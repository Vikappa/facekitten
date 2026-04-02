import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { FriendshipsRow, PostRow } from "@/types/db.generated";
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
import {
  PROFILE_PUBLIC_FRIEND_SELECT,
  mapRows,
  toProfileDto,
  type ProfileDto,
  type ProfilePublicFriendDb,
} from "@/types/db";

type FriendshipPair = Pick<FriendshipsRow, "user_a" | "user_b">;

type PostSnapshotRow = Pick<
  PostRow,
  "id" | "authorId" | "content" | "extraContent" | "mediaUrl" | "postType" | "created_at"
>;

type PostReduxSnapshot = {
  postId: string;
  authorId?: string;
  text?: string;
  postType?: string;
  postedAt?: string;
  commentNumber?: number;
  reactionsNumber?: number;
  postExtraContent?: string | null;
  postMediaUrl?: string | null;
};

type DbPostSnapshot = {
  postId: string;
  authorId: string;
  text: string;
  postType: string;
  postedAt: string;
  commentNumber: number;
  reactionsNumber: number;
  postExtraContent: string | null;
  postMediaUrl: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readFirstDefinedValue(
  source: Record<string, unknown>,
  keys: string[]
): unknown {
  for (const key of keys) {
    if (key in source) {
      return source[key];
    }
  }

  return undefined;
}

function parseNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed;
}

function parseComparableString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseNullableComparableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  return parseComparableString(value);
}

function parseOptionalCount(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined;
  }

  return Math.trunc(value);
}

function resolveSnapshotCandidate(body: unknown): Record<string, unknown> | null {
  if (!isRecord(body)) {
    return null;
  }

  const nestedCandidateKeys = [
    "post",
    "postData",
    "postDto",
    "postShallowDto",
    "snapshot",
    "postSnapshot",
    "dto",
    "payload",
  ];

  for (const key of nestedCandidateKeys) {
    const nestedCandidate = body[key];
    if (isRecord(nestedCandidate)) {
      return nestedCandidate;
    }
  }

  return body;
}

function parseBody(body: unknown): PostReduxSnapshot | null {
  const snapshotCandidate = resolveSnapshotCandidate(body);
  if (!snapshotCandidate) {
    return null;
  }

  const postId = parseNonEmptyString(
    readFirstDefinedValue(snapshotCandidate, ["postId", "PostId", "id"])
  );
  if (!postId) {
    return null;
  }

  const commentsArrayCandidate = readFirstDefinedValue(snapshotCandidate, [
    "comments",
    "commentData",
  ]);
  const reactionsArrayCandidate = readFirstDefinedValue(snapshotCandidate, [
    "reactions",
    "postReactions",
  ]);

  const parsedCommentCount = parseOptionalCount(
    readFirstDefinedValue(snapshotCandidate, [
      "commentNumber",
      "commentsNumber",
      "commentsCount",
    ])
  );
  const parsedReactionCount = parseOptionalCount(
    readFirstDefinedValue(snapshotCandidate, [
      "reactionsNumber",
      "reactionNumber",
      "reactionsCount",
    ])
  );

  const commentNumber =
    parsedCommentCount ??
    (Array.isArray(commentsArrayCandidate) ? commentsArrayCandidate.length : undefined);
  const reactionsNumber =
    parsedReactionCount ??
    (Array.isArray(reactionsArrayCandidate) ? reactionsArrayCandidate.length : undefined);

  const postTypeValue = readFirstDefinedValue(snapshotCandidate, ["postType"]);
  const postType =
    postTypeValue === null ? "post" : parseNonEmptyString(postTypeValue);

  const parsedSnapshot: PostReduxSnapshot = {
    postId,
    authorId: parseNonEmptyString(readFirstDefinedValue(snapshotCandidate, ["authorId"])),
    text: parseComparableString(readFirstDefinedValue(snapshotCandidate, ["text", "content"])),
    postType,
    postedAt: parseNonEmptyString(
      readFirstDefinedValue(snapshotCandidate, ["postedAt", "createdAt", "created_at"])
    ),
    commentNumber,
    reactionsNumber,
    postExtraContent: parseNullableComparableString(
      readFirstDefinedValue(snapshotCandidate, ["postExtraContent", "extraContent"])
    ),
    postMediaUrl: parseNullableComparableString(
      readFirstDefinedValue(snapshotCandidate, ["postMediaUrl", "postImageUrl", "mediaUrl"])
    ),
  };

  const hasAtLeastOneComparableField =
    parsedSnapshot.authorId !== undefined ||
    parsedSnapshot.text !== undefined ||
    parsedSnapshot.postType !== undefined ||
    parsedSnapshot.postedAt !== undefined ||
    parsedSnapshot.commentNumber !== undefined ||
    parsedSnapshot.reactionsNumber !== undefined ||
    parsedSnapshot.postExtraContent !== undefined ||
    parsedSnapshot.postMediaUrl !== undefined;

  return hasAtLeastOneComparableField ? parsedSnapshot : null;
}

function toDbSnapshot(
  post: PostSnapshotRow,
  commentNumber: number,
  reactionsNumber: number
): DbPostSnapshot {
  return {
    postId: post.id,
    authorId: post.authorId,
    text: post.content ?? "",
    postType: post.postType ?? "post",
    postedAt: post.created_at,
    commentNumber,
    reactionsNumber,
    postExtraContent: post.extraContent ?? null,
    postMediaUrl: post.mediaUrl ?? null,
  };
}

function isSnapshotUpToDate(
  clientSnapshot: PostReduxSnapshot,
  dbSnapshot: DbPostSnapshot
): boolean {
  if (clientSnapshot.postId !== dbSnapshot.postId) {
    return false;
  }

  if (
    typeof clientSnapshot.authorId === "string" &&
    clientSnapshot.authorId !== dbSnapshot.authorId
  ) {
    return false;
  }

  if (typeof clientSnapshot.text === "string" && clientSnapshot.text !== dbSnapshot.text) {
    return false;
  }

  if (
    typeof clientSnapshot.postType === "string" &&
    clientSnapshot.postType !== dbSnapshot.postType
  ) {
    return false;
  }

  if (
    typeof clientSnapshot.postedAt === "string" &&
    clientSnapshot.postedAt !== dbSnapshot.postedAt
  ) {
    return false;
  }

  if (
    typeof clientSnapshot.commentNumber === "number" &&
    clientSnapshot.commentNumber !== dbSnapshot.commentNumber
  ) {
    return false;
  }

  if (
    typeof clientSnapshot.reactionsNumber === "number" &&
    clientSnapshot.reactionsNumber !== dbSnapshot.reactionsNumber
  ) {
    return false;
  }

  if (
    clientSnapshot.postExtraContent !== undefined &&
    clientSnapshot.postExtraContent !== dbSnapshot.postExtraContent
  ) {
    return false;
  }

  if (
    clientSnapshot.postMediaUrl !== undefined &&
    clientSnapshot.postMediaUrl !== dbSnapshot.postMediaUrl
  ) {
    return false;
  }

  return true;
}

async function loadFriendIds(
  viewerProfileId: string,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<{ ok: true; friendIds: Set<string> } | { ok: false; response: NextResponse }> {
  const { data: friendships, error: friendshipsError } = await supabase
    .from("friendships")
    .select("user_a, user_b")
    .or(`user_a.eq.${viewerProfileId},user_b.eq.${viewerProfileId}`);

  if (friendshipsError) {
    console.error(
      "Errore recupero amicizie in post/get/friendsthatreactedto:",
      friendshipsError
    );
    return {
      ok: false,
      response: NextResponse.json(
        { code: "FRIENDSHIPS_FETCH_ERROR", error: "Errore interno" },
        { status: 500 }
      ),
    };
  }

  const friendIds = new Set<string>();
  for (const friendship of (friendships ?? []) as FriendshipPair[]) {
    if (friendship.user_a === viewerProfileId) {
      friendIds.add(friendship.user_b);
      continue;
    }

    if (friendship.user_b === viewerProfileId) {
      friendIds.add(friendship.user_a);
    }
  }

  return { ok: true, friendIds };
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
    console.error(
      "Errore recupero autori reply in post/get/friendsthatreactedto:",
      replyAuthorsError
    );
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
    console.error(
      "Errore recupero subpost condivisi in post/get/friendsthatreactedto:",
      sharedPostsError
    );
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
  let requestBody: unknown;
  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_BODY", error: "Body JSON non valido" },
      { status: 400 }
    );
  }

  const body = parseBody(requestBody);
  if (!body) {
    return NextResponse.json(
      { code: "INVALID_POST_SNAPSHOT", error: "Snapshot post non valido" },
      { status: 400 }
    );
  }

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
      console.error(
        "Errore risoluzione profilo in post/get/friendsthatreactedto:",
        auth.error
      );
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

  const { data: postSnapshotRow, error: postSnapshotError } = await supabase
    .from("post")
    .select("id, authorId, content, extraContent, mediaUrl, postType, created_at")
    .eq("id", body.postId)
    .limit(1)
    .maybeSingle<PostSnapshotRow>();

  if (postSnapshotError) {
    console.error(
      "Errore recupero snapshot post in post/get/friendsthatreactedto:",
      postSnapshotError
    );
    return NextResponse.json(
      { code: "POST_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!postSnapshotRow) {
    return NextResponse.json(
      { code: "POST_NOT_FOUND", error: "Post non trovato" },
      { status: 404 }
    );
  }

  const friendIdsResult = await loadFriendIds(auth.profileId, supabase);
  if (!friendIdsResult.ok) {
    return friendIdsResult.response;
  }

  const canAccessPost =
    postSnapshotRow.authorId === auth.profileId ||
    friendIdsResult.friendIds.has(postSnapshotRow.authorId);
  if (!canAccessPost) {
    return NextResponse.json(
      { code: "POST_ACCESS_DENIED", error: "Non autorizzato" },
      { status: 401 }
    );
  }

  const [commentsCountResult, reactionsCountResult] = await Promise.all([
    supabase
      .from("comment")
      .select("commentId", { head: true, count: "exact" })
      .eq("postid", body.postId),
    supabase
      .from("postReaction")
      .select("id", { head: true, count: "exact" })
      .eq("reactedPost", body.postId),
  ]);

  if (commentsCountResult.error) {
    console.error(
      "Errore conteggio commenti in post/get/friendsthatreactedto:",
      commentsCountResult.error
    );
    return NextResponse.json(
      { code: "POST_COUNTS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (reactionsCountResult.error) {
    console.error(
      "Errore conteggio reazioni in post/get/friendsthatreactedto:",
      reactionsCountResult.error
    );
    return NextResponse.json(
      { code: "POST_COUNTS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const dbSnapshot = toDbSnapshot(
    postSnapshotRow,
    commentsCountResult.count ?? 0,
    reactionsCountResult.count ?? 0
  );

  if (isSnapshotUpToDate(body, dbSnapshot)) {
    return NextResponse.json({ code: "OK" });
  }

  const { data: fullPost, error: fullPostError } = await supabase
    .from("post")
    .select(FEED_POST_SELECT)
    .eq("id", body.postId)
    .limit(1)
    .maybeSingle<FeedPost>();

  if (fullPostError) {
    console.error(
      "Errore recupero post completo in post/get/friendsthatreactedto:",
      fullPostError
    );
    return NextResponse.json(
      { code: "POST_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!fullPost) {
    return NextResponse.json(
      { code: "POST_NOT_FOUND", error: "Post non trovato" },
      { status: 404 }
    );
  }

  const replyAuthorsResult = await loadReplyAuthorsById(supabase, [fullPost]);
  if (!replyAuthorsResult.ok) {
    return replyAuthorsResult.response;
  }

  const sharedPostsResult = await loadSharedPostsById(supabase, [fullPost]);
  if (!sharedPostsResult.ok) {
    return sharedPostsResult.response;
  }

  const [postForReduxUi] = mapFeedPostsToPostData(
    [fullPost],
    replyAuthorsResult.replyAuthorsById,
    sharedPostsResult.sharedPostsById
  );

  if (!postForReduxUi) {
    return NextResponse.json(
      { code: "POST_DTO_MAPPING_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const reactedFriendIds = Array.from(
    new Set(
      (fullPost.postReactions ?? [])
        .map((reaction) => reaction.reactedBy)
        .filter(
          (reactedBy): reactedBy is string =>
            typeof reactedBy === "string" && reactedBy.trim().length > 0
        )
        .filter((reactedBy) => friendIdsResult.friendIds.has(reactedBy))
    )
  );

  let friendsThatReacted: ProfileDto[] = [];
  if (reactedFriendIds.length > 0) {
    const { data: profileRows, error: profileRowsError } = await supabase
      .from("Profile")
      .select(PROFILE_PUBLIC_FRIEND_SELECT)
      .in("id", reactedFriendIds)
      .returns<ProfilePublicFriendDb[]>();

    if (profileRowsError) {
      console.error(
        "Errore recupero profili amici reagenti in post/get/friendsthatreactedto:",
        profileRowsError
      );
      return NextResponse.json(
        { code: "REACTED_FRIEND_PROFILES_FETCH_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    const profilesById = new Map(
      mapRows(profileRows, toProfileDto).map((profileDto) => [profileDto.id, profileDto])
    );
    friendsThatReacted = reactedFriendIds
      .map((profileId) => profilesById.get(profileId))
      .filter((profile): profile is ProfileDto => !!profile);
  }

  return NextResponse.json({
    code: "POST_REFRESH_REQUIRED",
    post: postForReduxUi,
    friendsThatReacted,
  });
}
