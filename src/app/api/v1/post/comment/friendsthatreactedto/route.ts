import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { CommentRow, FriendshipsRow, PostRow } from "@/types/db.generated";
import {
  FEED_POST_SELECT,
  PROFILE_METADATA_SELECT,
  collectReplyAuthorIds,
  mapFeedPostsToPostData,
  type FeedAuthor,
  type FeedComment,
  type FeedPost,
} from "@/app/api/v1/post/get/feedDto";
import {
  PROFILE_PUBLIC_FRIEND_SELECT,
  mapRows,
  toProfileDto,
  type ProfileDto,
  type ProfilePublicFriendDb,
} from "@/types/db";

type FriendshipPair = Pick<FriendshipsRow, "user_a" | "user_b">;
type ParentPostIdentityRow = Pick<PostRow, "id" | "authorId">;
type CommentSnapshotRow = Pick<
  CommentRow,
  | "commentId"
  | "commentAuthorId"
  | "commentText"
  | "postid"
  | "extraContent"
  | "created_at"
>;

type CommentReduxSnapshot = {
  commentId: string;
  authorId?: string;
  commentText?: string;
  commentedAt?: string;
  reactionNumbers?: number;
  commentRepliesCount?: number;
  postId?: string;
  commentExtraContent?: string | null;
};

type DbCommentSnapshot = {
  commentId: string;
  authorId: string;
  commentText: string;
  commentedAt: string;
  reactionNumbers: number;
  commentRepliesCount: number;
  postId: string;
  commentExtraContent: string | null;
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
    "comment",
    "commentData",
    "commentDto",
    "commentShallowDto",
    "snapshot",
    "commentSnapshot",
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

function parseBody(body: unknown): CommentReduxSnapshot | null {
  const snapshotCandidate = resolveSnapshotCandidate(body);
  if (!snapshotCandidate) {
    return null;
  }

  const commentId = parseNonEmptyString(
    readFirstDefinedValue(snapshotCandidate, ["commentId", "CommentId", "id"])
  );
  if (!commentId) {
    return null;
  }

  const reactionsArrayCandidate = readFirstDefinedValue(snapshotCandidate, [
    "reactions",
    "commentReactions",
  ]);
  const repliesArrayCandidate = readFirstDefinedValue(snapshotCandidate, [
    "commentReplies",
    "replies",
  ]);

  const parsedReactionCount = parseOptionalCount(
    readFirstDefinedValue(snapshotCandidate, [
      "reactionNumbers",
      "reactionsNumber",
      "reactionsCount",
      "reactionCount",
    ])
  );
  const parsedRepliesCount = parseOptionalCount(
    readFirstDefinedValue(snapshotCandidate, [
      "commentRepliesCount",
      "commentReplyCount",
      "repliesCount",
      "replyCount",
    ])
  );

  const reactionNumbers =
    parsedReactionCount ??
    (Array.isArray(reactionsArrayCandidate) ? reactionsArrayCandidate.length : undefined);
  const commentRepliesCount =
    parsedRepliesCount ??
    (Array.isArray(repliesArrayCandidate) ? repliesArrayCandidate.length : undefined);

  const parsedSnapshot: CommentReduxSnapshot = {
    commentId,
    authorId: parseNonEmptyString(readFirstDefinedValue(snapshotCandidate, ["authorId"])),
    commentText: parseComparableString(
      readFirstDefinedValue(snapshotCandidate, ["commentText", "text"])
    ),
    commentedAt: parseNonEmptyString(
      readFirstDefinedValue(snapshotCandidate, ["commentedAt", "createdAt", "created_at"])
    ),
    reactionNumbers,
    commentRepliesCount,
    postId: parseNonEmptyString(readFirstDefinedValue(snapshotCandidate, ["postId"])),
    commentExtraContent: parseNullableComparableString(
      readFirstDefinedValue(snapshotCandidate, ["commentExtraContent", "extraContent"])
    ),
  };

  const hasAtLeastOneComparableField =
    parsedSnapshot.authorId !== undefined ||
    parsedSnapshot.commentText !== undefined ||
    parsedSnapshot.commentedAt !== undefined ||
    parsedSnapshot.reactionNumbers !== undefined ||
    parsedSnapshot.commentRepliesCount !== undefined ||
    parsedSnapshot.postId !== undefined ||
    parsedSnapshot.commentExtraContent !== undefined;

  return hasAtLeastOneComparableField ? parsedSnapshot : null;
}

function toDbSnapshot(
  comment: CommentSnapshotRow,
  reactionNumbers: number,
  commentRepliesCount: number
): DbCommentSnapshot | null {
  if (!comment.commentAuthorId || !comment.postid) {
    return null;
  }

  return {
    commentId: comment.commentId,
    authorId: comment.commentAuthorId,
    commentText: comment.commentText ?? "",
    commentedAt: comment.created_at,
    reactionNumbers,
    commentRepliesCount,
    postId: comment.postid,
    commentExtraContent: comment.extraContent ?? null,
  };
}

function isSnapshotUpToDate(
  clientSnapshot: CommentReduxSnapshot,
  dbSnapshot: DbCommentSnapshot
): boolean {
  if (clientSnapshot.commentId !== dbSnapshot.commentId) {
    return false;
  }

  if (
    typeof clientSnapshot.authorId === "string" &&
    clientSnapshot.authorId !== dbSnapshot.authorId
  ) {
    return false;
  }

  if (
    typeof clientSnapshot.commentText === "string" &&
    clientSnapshot.commentText !== dbSnapshot.commentText
  ) {
    return false;
  }

  if (
    typeof clientSnapshot.commentedAt === "string" &&
    clientSnapshot.commentedAt !== dbSnapshot.commentedAt
  ) {
    return false;
  }

  if (
    typeof clientSnapshot.reactionNumbers === "number" &&
    clientSnapshot.reactionNumbers !== dbSnapshot.reactionNumbers
  ) {
    return false;
  }

  if (
    typeof clientSnapshot.commentRepliesCount === "number" &&
    clientSnapshot.commentRepliesCount !== dbSnapshot.commentRepliesCount
  ) {
    return false;
  }

  if (typeof clientSnapshot.postId === "string" && clientSnapshot.postId !== dbSnapshot.postId) {
    return false;
  }

  if (
    clientSnapshot.commentExtraContent !== undefined &&
    clientSnapshot.commentExtraContent !== dbSnapshot.commentExtraContent
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
      "Errore recupero amicizie in post/comment/friendsthatreactedto:",
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
      "Errore recupero autori reply in post/comment/friendsthatreactedto:",
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

function findRawCommentById(
  post: FeedPost,
  commentId: string
): FeedComment | null {
  for (const comment of post.comments ?? []) {
    if (comment.commentId === commentId) {
      return comment;
    }
  }

  return null;
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
      { code: "INVALID_COMMENT_SNAPSHOT", error: "Snapshot commento non valido" },
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
        "Errore risoluzione profilo in post/comment/friendsthatreactedto:",
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

  const { data: commentSnapshotRow, error: commentSnapshotError } = await supabase
    .from("comment")
    .select("commentId, commentAuthorId, commentText, postid, extraContent, created_at")
    .eq("commentId", body.commentId)
    .limit(1)
    .maybeSingle<CommentSnapshotRow>();

  if (commentSnapshotError) {
    console.error(
      "Errore recupero snapshot commento in post/comment/friendsthatreactedto:",
      commentSnapshotError
    );
    return NextResponse.json(
      { code: "COMMENT_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!commentSnapshotRow) {
    return NextResponse.json(
      { code: "COMMENT_NOT_FOUND", error: "Commento non trovato" },
      { status: 404 }
    );
  }

  if (!commentSnapshotRow.postid) {
    return NextResponse.json(
      { code: "COMMENT_POST_NOT_FOUND", error: "Post del commento non trovato" },
      { status: 404 }
    );
  }

  const { data: parentPostIdentity, error: parentPostIdentityError } = await supabase
    .from("post")
    .select("id, authorId")
    .eq("id", commentSnapshotRow.postid)
    .limit(1)
    .maybeSingle<ParentPostIdentityRow>();

  if (parentPostIdentityError) {
    console.error(
      "Errore recupero post padre in post/comment/friendsthatreactedto:",
      parentPostIdentityError
    );
    return NextResponse.json(
      { code: "POST_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!parentPostIdentity) {
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
    parentPostIdentity.authorId === auth.profileId ||
    friendIdsResult.friendIds.has(parentPostIdentity.authorId);
  if (!canAccessPost) {
    return NextResponse.json(
      { code: "POST_ACCESS_DENIED", error: "Non autorizzato" },
      { status: 401 }
    );
  }

  const [reactionsCountResult, repliesCountResult] = await Promise.all([
    supabase
      .from("commentReaction")
      .select("commReactId", { head: true, count: "exact" })
      .eq("reactedComment", body.commentId),
    supabase
      .from("commentReply")
      .select("commentReplyId", { head: true, count: "exact" })
      .eq("repliedComment", body.commentId),
  ]);

  if (reactionsCountResult.error) {
    console.error(
      "Errore conteggio reazioni commento in post/comment/friendsthatreactedto:",
      reactionsCountResult.error
    );
    return NextResponse.json(
      { code: "COMMENT_COUNTS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (repliesCountResult.error) {
    console.error(
      "Errore conteggio reply commento in post/comment/friendsthatreactedto:",
      repliesCountResult.error
    );
    return NextResponse.json(
      { code: "COMMENT_COUNTS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const dbSnapshot = toDbSnapshot(
    commentSnapshotRow,
    reactionsCountResult.count ?? 0,
    repliesCountResult.count ?? 0
  );

  if (!dbSnapshot) {
    return NextResponse.json(
      { code: "COMMENT_SNAPSHOT_INVALID", error: "Commento non valido" },
      { status: 500 }
    );
  }

  if (isSnapshotUpToDate(body, dbSnapshot)) {
    return NextResponse.json({ code: "OK" });
  }

  const { data: fullPost, error: fullPostError } = await supabase
    .from("post")
    .select(FEED_POST_SELECT)
    .eq("id", dbSnapshot.postId)
    .limit(1)
    .maybeSingle<FeedPost>();

  if (fullPostError) {
    console.error(
      "Errore recupero post completo in post/comment/friendsthatreactedto:",
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

  const [postForReduxUi] = mapFeedPostsToPostData(
    [fullPost],
    replyAuthorsResult.replyAuthorsById
  );

  if (!postForReduxUi) {
    return NextResponse.json(
      { code: "POST_DTO_MAPPING_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const commentForReduxUi = postForReduxUi.comments.find(
    (candidate) => candidate.commentId === dbSnapshot.commentId
  );
  if (!commentForReduxUi) {
    return NextResponse.json(
      { code: "COMMENT_DTO_MAPPING_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const rawComment = findRawCommentById(fullPost, dbSnapshot.commentId);
  if (!rawComment) {
    return NextResponse.json(
      { code: "COMMENT_NOT_FOUND", error: "Commento non trovato" },
      { status: 404 }
    );
  }

  const reactedFriendIds = Array.from(
    new Set(
      (rawComment.commentReactions ?? [])
        .map((reaction) => reaction.reactionAuthorId)
        .filter(
          (reactionAuthorId): reactionAuthorId is string =>
            typeof reactionAuthorId === "string" && reactionAuthorId.trim().length > 0
        )
        .filter((reactionAuthorId) => friendIdsResult.friendIds.has(reactionAuthorId))
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
        "Errore recupero profili amici reagenti commento in post/comment/friendsthatreactedto:",
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
    code: "COMMENT_REFRESH_REQUIRED",
    comment: commentForReduxUi,
    friendsThatReacted,
  });
}
