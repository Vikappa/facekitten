import { NextRequest, NextResponse } from "next/server";

import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { FriendshipsRow } from "@/types/db.generated";

type FriendshipPair = Pick<FriendshipsRow, "user_a" | "user_b">;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();

  const supabase = createSupabaseAdminClient();
  const auth = await resolveAuthenticatedProfileIdFromRequest(request, supabase);

  if (!auth.ok) {
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

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  const { data: friendships, error: friendshipsError } = await supabase
    .from("friendships")
    .select("user_a, user_b")
    .or(`user_a.eq.${auth.profileId},user_b.eq.${auth.profileId}`);

  if (friendshipsError) {
    console.error("Errore recupero amicizie in search/profiles:", friendshipsError);
    return NextResponse.json(
      { code: "FRIENDSHIPS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

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
  if (friendIdList.length === 0) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("Profile")
    .select("id, username, avatarUrl")
    .in("id", friendIdList)
    .ilike("username", `%${query}%`)
    .limit(10);

  if (error) {
    console.error("Errore ricerca profili amici in search/profiles:", error);
    return NextResponse.json(
      { code: "PROFILES_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}
