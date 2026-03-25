import {
  resolveAuthenticatedProfileIdFromRequest,
  type AuthenticatedProfileIdResult,
} from "@/lib/Security/SessionRequestProfileResolver";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type {
  FriendshipRequestRow,
  FriendshipsInsert,
  NotificationsInsert,
} from "@/types/db.generated";
import { FRIENDSHIP_SAFE_SELECT, type FriendshipDb } from "@/types/db";
import { FRIENDSHIP_STATUS } from "@/types/friendship";
import { NextRequest, NextResponse } from "next/server";

type AcceptFriendRequestBody = {
  requestId?: number | string;
  senderProfileId?: string;
};

type FriendshipRequestLookupRow = Pick<
  FriendshipRequestRow,
  "id" | "sender" | "target" | "accepted"
>;

function parseRequestId(payload: unknown): number | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const candidate = payload as AcceptFriendRequestBody;
  const rawValue = candidate.requestId;

  let parsedValue: number;
  if (typeof rawValue === "number") {
    parsedValue = rawValue;
  } else if (typeof rawValue === "string") {
    parsedValue = Number(rawValue.trim());
  } else {
    return null;
  }

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

function parseSenderProfileId(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const candidate = payload as AcceptFriendRequestBody;
  if (typeof candidate.senderProfileId !== "string") {
    return null;
  }

  const normalizedSenderProfileId = candidate.senderProfileId.trim();
  return normalizedSenderProfileId.length > 0 ? normalizedSenderProfileId : null;
}

function toAuthErrorResponse(
  auth: Exclude<AuthenticatedProfileIdResult, { ok: true }>
): NextResponse {
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
    console.error("Errore risoluzione profilo accettazione richiesta API:", auth.error);
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

  const supabase = createSupabaseAdminClient();
  const auth = await resolveAuthenticatedProfileIdFromRequest(req, supabase);

  if (!auth.ok) {
    return toAuthErrorResponse(auth);
  }

  const requestId = parseRequestId(requestBody);
  const senderProfileId = parseSenderProfileId(requestBody);

  let friendRequest: FriendshipRequestLookupRow | null = null;
  let friendRequestError: unknown = null;

  if (requestId) {
    const { data, error } = await supabase
      .from("friendshipRequest")
      .select("id, sender, target, accepted")
      .eq("id", requestId)
      .limit(1)
      .maybeSingle<FriendshipRequestLookupRow>();

    friendRequest = data;
    friendRequestError = error;
  } else if (senderProfileId) {
    const { data, error } = await supabase
      .from("friendshipRequest")
      .select("id, sender, target, accepted")
      .eq("sender", senderProfileId)
      .eq("target", auth.profileId)
      .is("accepted", null)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle<FriendshipRequestLookupRow>();

    friendRequest = data;
    friendRequestError = error;
  } else {
    return NextResponse.json(
      {
        code: "INVALID_REQUEST_IDENTIFIER",
        error: "Id richiesta o senderProfileId non valido",
      },
      { status: 400 }
    );
  }

  if (friendRequestError) {
    console.error("Errore recupero richiesta amicizia API:", friendRequestError);
    return NextResponse.json(
      { code: "FRIEND_REQUEST_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!friendRequest) {
    return NextResponse.json(
      { code: "FRIEND_REQUEST_NOT_FOUND", error: "Richiesta non trovata" },
      { status: 404 }
    );
  }

  if (!friendRequest.sender || !friendRequest.target) {
    return NextResponse.json(
      { code: "FRIEND_REQUEST_INVALID", error: "Richiesta non valida" },
      { status: 409 }
    );
  }

  if (friendRequest.target !== auth.profileId) {
    return NextResponse.json(
      { code: "FRIEND_REQUEST_FORBIDDEN", error: "Non autorizzato" },
      { status: 403 }
    );
  }

  if (friendRequest.accepted === true) {
    return NextResponse.json(
      {
        code: "FRIEND_REQUEST_ALREADY_ACCEPTED",
        requestId: friendRequest.id,
        friendshipStatus: FRIENDSHIP_STATUS.AMICO,
      },
      { status: 409 }
    );
  }

  if (friendRequest.accepted === false) {
    return NextResponse.json(
      { code: "FRIEND_REQUEST_ALREADY_PROCESSED", error: "Richiesta già processata" },
      { status: 409 }
    );
  }

  const { data: existingFriendship, error: existingFriendshipError } = await supabase
    .from("friendships")
    .select(FRIENDSHIP_SAFE_SELECT)
    .or(
      `and(user_a.eq.${friendRequest.sender},user_b.eq.${friendRequest.target}),and(user_a.eq.${friendRequest.target},user_b.eq.${friendRequest.sender})`
    )
    .limit(1)
    .maybeSingle<FriendshipDb>();

  if (existingFriendshipError) {
    console.error("Errore verifica amicizia prima di accettare API:", existingFriendshipError);
    return NextResponse.json(
      { code: "FRIENDSHIP_CHECK_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!existingFriendship) {
    const newFriendship: FriendshipsInsert = {
      user_a: friendRequest.sender,
      user_b: friendRequest.target,
    };

    const { error: createFriendshipError } = await supabase
      .from("friendships")
      .insert(newFriendship);

    if (createFriendshipError && createFriendshipError.code !== "23505") {
      console.error("Errore creazione amicizia da richiesta API:", createFriendshipError);
      return NextResponse.json(
        { code: "FRIENDSHIP_CREATE_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }
  }

  const { data: acceptedRequest, error: acceptRequestError } = await supabase
    .from("friendshipRequest")
    .update({ accepted: true })
    .eq("id", friendRequest.id)
    .is("accepted", null)
    .select("id")
    .limit(1)
    .maybeSingle<{ id: number }>();

  if (acceptRequestError) {
    console.error("Errore conferma richiesta amicizia API:", acceptRequestError);
    return NextResponse.json(
      { code: "FRIEND_REQUEST_ACCEPT_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!acceptedRequest) {
    return NextResponse.json(
      { code: "FRIEND_REQUEST_ALREADY_PROCESSED", error: "Richiesta già processata" },
      { status: 409 }
    );
  }

  const newNotification: NotificationsInsert = {
    activity_from: auth.profileId,
    to: friendRequest.sender,
    generatedNavigation: `/profile/${encodeURIComponent(auth.profileId)}`,
    notificationType: "friendRequestAccepted",
    seen: false,
  };

  const { error: createNotificationError } = await supabase
    .from("notifications")
    .insert(newNotification);

  if (createNotificationError) {
    console.error(
      "Errore creazione notifica accettazione richiesta amicizia API:",
      createNotificationError
    );
    return NextResponse.json(
      { code: "NOTIFICATION_CREATE_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    code: "FRIEND_REQUEST_ACCEPTED",
    requestId: friendRequest.id,
    friendship: {
      userA: friendRequest.sender,
      userB: friendRequest.target,
    },
    friendshipStatus: FRIENDSHIP_STATUS.AMICO,
  });
}
