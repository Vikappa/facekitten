import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import { NextRequest, NextResponse } from "next/server";
import type { FriendshipRequestRow } from "@/types/db.generated";
import {
  FRIENDSHIP_SAFE_SELECT,
  PROFILE_PUBLIC_FRIEND_SELECT,
  PROFILE_PUBLIC_SAFE_SELECT,
  toProfileDto,
  type FriendshipDb,
  type ProfilePublicFriendDb,
  type ProfilePublicDb,
} from "@/types/db";
import { FRIENDSHIP_STATUS, type FriendshipStatus } from "@/types/friendship";
import { GetLocationById } from "@/lib/services/searchLocation/GetLocationById";

type PendingFriendRequestRow = {
  sender: FriendshipRequestRow["sender"];
  target: FriendshipRequestRow["target"];
  accepted: FriendshipRequestRow["accepted"];
};

function parseRequestedProfileId(req: NextRequest): string | null {
  const byId = req.nextUrl.searchParams.get("id");
  const byProfileId = req.nextUrl.searchParams.get("profileId");
  const resolved = byId ?? byProfileId;

  if (!resolved) {
    return null;
  }

  const trimmed = resolved.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return trimmed;
}

export async function POST(req: NextRequest) {
  const requestedProfileId = parseRequestedProfileId(req);
  if (!requestedProfileId) {
    return NextResponse.json(
      { code: "INVALID_PROFILE_ID", error: "Parametro id non valido" },
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
      console.error("Errore risoluzione profilo in profile/get:", auth.error);
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

  const { data: profileBaseRow, error: profileError } = await supabase
    .from("Profile")
    .select(PROFILE_PUBLIC_SAFE_SELECT)
    .eq("id", requestedProfileId)
    .limit(1)
    .maybeSingle<ProfilePublicDb>();

  if (profileError) {
    console.error("Errore durante il recupero profilo singolo:", profileError);
    return NextResponse.json(
      { code: "PROFILE_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!profileBaseRow) {
    return NextResponse.json(
      { code: "PROFILE_NOT_FOUND", error: "Profilo non trovato" },
      { status: 404 }
    );
  }

  let friendshipStatus: FriendshipStatus =
    requestedProfileId === auth.profileId
      ? FRIENDSHIP_STATUS.AMICO
      : FRIENDSHIP_STATUS.NON_AMICO;

  if (requestedProfileId !== auth.profileId) {
    const { data: friendship, error: friendshipError } = await supabase
      .from("friendships")
      .select(FRIENDSHIP_SAFE_SELECT)
      .or(
        `and(user_a.eq.${auth.profileId},user_b.eq.${requestedProfileId}),and(user_a.eq.${requestedProfileId},user_b.eq.${auth.profileId})`
      )
      .limit(1)
      .maybeSingle<FriendshipDb>();

    if (friendshipError) {
      console.error("Errore controllo amicizia profilo singolo:", friendshipError);
      return NextResponse.json(
        { code: "FRIENDSHIP_CHECK_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    if (friendship) {
      friendshipStatus = FRIENDSHIP_STATUS.AMICO;
    } else {
      const { data: sentRequest, error: sentRequestError } = await supabase
      .from("friendshipRequest")
      .select("sender, target, accepted")
      .eq("sender", auth.profileId)
      .eq("target", requestedProfileId)
      .is("accepted", null)
      .limit(1)
      .maybeSingle<PendingFriendRequestRow>();

      if (sentRequestError) {
        console.error(
          "Errore controllo richiesta amicizia inviata profilo singolo:",
          sentRequestError
        );
        return NextResponse.json(
          { code: "FRIEND_REQUEST_CHECK_ERROR", error: "Errore interno" },
          { status: 500 }
        );
      }

      if (sentRequest) {
        friendshipStatus = FRIENDSHIP_STATUS.RICHIESTA_INVIATA;
      } else {
        const { data: receivedRequest, error: receivedRequestError } = await supabase
          .from("friendshipRequest")
          .select("sender, target, accepted")
          .eq("sender", requestedProfileId)
          .eq("target", auth.profileId)
          .is("accepted", null)
          .limit(1)
          .maybeSingle<PendingFriendRequestRow>();

        if (receivedRequestError) {
          console.error(
            "Errore controllo richiesta amicizia ricevuta profilo singolo:",
            receivedRequestError
          );
          return NextResponse.json(
            { code: "FRIEND_REQUEST_CHECK_ERROR", error: "Errore interno" },
            { status: 500 }
          );
        }

        friendshipStatus = receivedRequest
          ? FRIENDSHIP_STATUS.RICHIESTA_RICEVUTA
          : FRIENDSHIP_STATUS.NON_AMICO;
      }
    }
  }

  const shouldIncludeFriendFields =
    requestedProfileId === auth.profileId ||
    friendshipStatus === FRIENDSHIP_STATUS.AMICO;

  let profileRow: ProfilePublicDb | ProfilePublicFriendDb = profileBaseRow;

  if (shouldIncludeFriendFields) {
    const { data: profileFriendRow, error: profileFriendError } = await supabase
      .from("Profile")
      .select(PROFILE_PUBLIC_FRIEND_SELECT)
      .eq("id", requestedProfileId)
      .limit(1)
      .maybeSingle<ProfilePublicFriendDb>();

    if (profileFriendError) {
      console.error(
        "Errore durante il recupero profilo friend fields:",
        profileFriendError
      );
      return NextResponse.json(
        { code: "PROFILE_FETCH_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    if (!profileFriendRow) {
      return NextResponse.json(
        { code: "PROFILE_NOT_FOUND", error: "Profilo non trovato" },
        { status: 404 }
      );
    }

    profileRow = profileFriendRow;
  }

  let dto = toProfileDto(profileRow);

  dto.locationId = await fetchLocationName(dto.locationId?? null).then(l => l?.descr)


  return NextResponse.json({
    code: "PROFILE_DATA_OK",
    profile: dto,
    friendshipStatus,
  });
}


async function fetchLocationName(id:string|null) {
  if(id == null) return null

        try {
        const location = await GetLocationById(id);

        return location
        } catch {
            console.error("Non sono riuscito a scarica le info della location :C", id)
        }
    }
