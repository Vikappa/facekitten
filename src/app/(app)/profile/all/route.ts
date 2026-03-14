import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { FriendshipRequestRow } from "@/types/db.generated";
import { NextRequest, NextResponse } from "next/server";
import {
  FRIENDSHIP_SAFE_SELECT,
  PROFILE_PUBLIC_SAFE_SELECT,
  mapRows,
  toFriendshipDto,
  toProfileDto,
  type FriendshipDb,
  type ProfileDto,
  type ProfilePublicDb,
} from "@/types/db";

export type FriendshipStatus =
  | "amico"
  | "non_amico"
  | "richiesta_inviata";

export type ProfileWithFriendshipDto = {
  profile: ProfileDto;
  friendshipStatus: FriendshipStatus;
};

type PendingFriendRequestRow = {
  sender: FriendshipRequestRow["sender"];
  target: FriendshipRequestRow["target"];
  accepted: FriendshipRequestRow["accepted"];
};

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

  const { data: friendshipsRows, error: friendshipsError } = await supabase
    .from("friendships")
    .select(FRIENDSHIP_SAFE_SELECT)
    .or(`user_a.eq.${auth.profileId},user_b.eq.${auth.profileId}`)
    .returns<FriendshipDb[]>();

  if (friendshipsError) {
    console.error("Errore durante il recupero delle amicizie:", friendshipsError);
    return NextResponse.json(
      { code: "FRIENDSHIPS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const friendIds = new Set<string>();
  const friendships = mapRows(friendshipsRows, toFriendshipDto);

  for (const friendship of friendships) {
    if (friendship.userA === auth.profileId) {
      friendIds.add(friendship.userB);
      continue;
    }

    if (friendship.userB === auth.profileId) {
      friendIds.add(friendship.userA);
    }
  }

  const { data: sentRequestsRows, error: sentRequestsError } = await supabase
    .from("friendshipRequest")
    .select("sender, target, accepted")
    .eq("sender", auth.profileId)
    .is("accepted", null)
    .returns<PendingFriendRequestRow[]>();

  if (sentRequestsError) {
    console.error("Errore durante il recupero richieste inviate:", sentRequestsError);
    return NextResponse.json(
      { code: "SENT_REQUESTS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const sentRequestIds = new Set<string>(
    (sentRequestsRows ?? [])
      .map((request) => request.target)
      .filter((profileId): profileId is string => typeof profileId === "string")
  );

  const { data: profilesRows, error: profilesError } = await supabase
    .from("Profile")
    .select(PROFILE_PUBLIC_SAFE_SELECT)
    .neq("id", auth.profileId)
    .order("createdAt", { ascending: false })
    .returns<ProfilePublicDb[]>();

  if (profilesError) {
    console.error("Errore durante il recupero di tutti i profili:", profilesError);
    return NextResponse.json(
      { code: "PROFILES_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const profiles: ProfileWithFriendshipDto[] = mapRows(profilesRows, toProfileDto).map(
    (profile) => ({
      profile,
      friendshipStatus: friendIds.has(profile.id)
        ? "amico"
        : sentRequestIds.has(profile.id)
          ? "richiesta_inviata"
          : "non_amico",
    })
  );

  return NextResponse.json({
    code: "PROFILES_DATA_OK",
    profiles,
  });
}
