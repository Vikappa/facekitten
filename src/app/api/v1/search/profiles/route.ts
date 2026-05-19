import { NextRequest, NextResponse } from "next/server";

import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { FriendshipsRow } from "@/types/db.generated";

type FriendshipPair = Pick<FriendshipsRow, "user_a" | "user_b">;

const LOG_PREFIX = "[api/v1/search/profiles]";

function logSearchProfiles(step: string, details?: Record<string, unknown>) {
  console.log(`${LOG_PREFIX} ${step}`, details ?? {});
}

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 10);
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const rawQuery = searchParams.get("query");
  const query = (rawQuery ?? "").trim();

  logSearchProfiles("request:start", {
    requestId,
    pathname: requestUrl.pathname,
    rawQuery,
    normalizedQuery: query,
    queryLength: query.length,
  });

  const supabase = createSupabaseAdminClient();
  const auth = await resolveAuthenticatedProfileIdFromRequest(request, supabase);

  if (!auth.ok) {
    logSearchProfiles("auth:failed", {
      requestId,
      code: auth.code,
    });

    if (auth.code === "SESSION_REQUIRED") {
      return NextResponse.json(
        { code: "SESSION_REQUIRED", error: "Sessione mancante" },
        { status: 401 }
      );
    }

    if (auth.code === "INVALID_SESSION") {
      const response = NextResponse.json(
        { code: "INVALID_SESSION", error: "Sessione non valida" },
        { status: 401 }
      );
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    if (auth.code === "INVALID_SESSION_IDENTITY") {
      return NextResponse.json(
        { code: "INVALID_SESSION_IDENTITY", error: "Sessione non valida" },
        { status: 401 }
      );
    }

    if (auth.code === "PROFILE_RESOLUTION_ERROR") {
      console.error("Errore risoluzione profilo in search/profiles:", auth.error);
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

  logSearchProfiles("auth:ok", {
    requestId,
    profileId: auth.profileId,
  });

  if (query.length < 2) {
    logSearchProfiles("query:too_short", {
      requestId,
      query,
      queryLength: query.length,
    });
    return NextResponse.json([]);
  }

  logSearchProfiles("friendships:query:start", {
    requestId,
    profileId: auth.profileId,
  });

  const { data: friendships, error: friendshipsError } = await supabase
    .from("friendships")
    .select("user_a, user_b")
    .or(`user_a.eq.${auth.profileId},user_b.eq.${auth.profileId}`);

  if (friendshipsError) {
    console.error(`${LOG_PREFIX} friendships:query:error`, {
      requestId,
      message: friendshipsError.message,
      code: friendshipsError.code,
      details: friendshipsError.details,
      hint: friendshipsError.hint,
    });
    console.error("Errore recupero amicizie in search/profiles:", friendshipsError);
    return NextResponse.json(
      { code: "FRIENDSHIPS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  logSearchProfiles("friendships:query:ok", {
    requestId,
    friendshipRowsCount: friendships?.length ?? 0,
    friendships,
  });

  const friendIds = new Set<string>();
  for (const friendship of (friendships ?? []) as FriendshipPair[]) {
    if (friendship.user_a === auth.profileId) {
      friendIds.add(friendship.user_b);
      continue;
    }

    if (friendship.user_b === auth.profileId) {
      friendIds.add(friendship.user_a);
    }
  }

  const friendIdList = Array.from(friendIds);
  logSearchProfiles("friendships:friend_ids", {
    requestId,
    friendIdsCount: friendIdList.length,
    friendIds: friendIdList,
  });

  if (friendIdList.length === 0) {
    logSearchProfiles("response:empty:no_friends", {
      requestId,
      profileId: auth.profileId,
      query,
    });
    return NextResponse.json([]);
  }

  logSearchProfiles("profiles:query:start", {
    requestId,
    query,
    ilikePattern: `%${query}%`,
    friendIdsCount: friendIdList.length,
    limit: 10,
  });

  const { data, error } = await supabase
    .from("Profile")
    .select("id, username, avatarUrl")
    .in("id", friendIdList)
    .ilike("username", `%${query}%`)
    .limit(10);

  if (error) {
    console.error(`${LOG_PREFIX} profiles:query:error`, {
      requestId,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    console.error("Errore ricerca profili amici in search/profiles:", error);
    return NextResponse.json(
      { code: "PROFILES_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  logSearchProfiles("profiles:query:ok", {
    requestId,
    resultCount: data?.length ?? 0,
    profiles: (data ?? []).map((profile) => ({
      id: profile.id,
      username: profile.username,
    })),
  });

  return NextResponse.json(data ?? []);
}
