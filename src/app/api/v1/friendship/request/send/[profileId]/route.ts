import {
  resolveAuthenticatedProfileIdFromRequest,
  type AuthenticatedProfileIdResult,
} from "@/lib/Security/SessionRequestProfileResolver";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type {
  FriendshipRequestInsert,
  FriendshipRequestRow,
  NotificationsInsert,
} from "@/types/db.generated";
import { FRIENDSHIP_SAFE_SELECT, type FriendshipDb } from "@/types/db";
import { FRIENDSHIP_STATUS } from "@/types/friendship";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ profileId?: string }> | { profileId?: string };
};

type PendingFriendRequestRow = Pick<
  FriendshipRequestRow,
  "id" | "sender" | "target" | "accepted"
>;

function normalizeProfileId(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedProfileId = value.trim();
  return normalizedProfileId.length > 0 ? normalizedProfileId : null;
}

async function parseTargetProfileId(context: RouteContext): Promise<string | null> {
  const params = await Promise.resolve(context.params);
  return normalizeProfileId(params.profileId);
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
    console.error("Errore risoluzione profilo invio richiesta amicizia API:", auth.error);
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

export async function POST(req: NextRequest, context: RouteContext) {
  const targetProfileId = await parseTargetProfileId(context);
  if (!targetProfileId) {
    return NextResponse.json(
      { code: "INVALID_TARGET_PROFILE_ID", error: "Target profilo non valido" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const auth = await resolveAuthenticatedProfileIdFromRequest(req, supabase);

  if (!auth.ok) {
    return toAuthErrorResponse(auth);
  }

  if (targetProfileId === auth.profileId) {
    return NextResponse.json(
      { code: "CANNOT_REQUEST_SELF", error: "Non puoi inviarti una richiesta di amicizia" },
      { status: 400 }
    );
  }

  const { data: targetProfile, error: targetProfileError } = await supabase
    .from("Profile")
    .select("id")
    .eq("id", targetProfileId)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (targetProfileError) {
    console.error(
      "Errore verifica profilo destinatario richiesta API:",
      targetProfileError
    );
    return NextResponse.json(
      { code: "TARGET_PROFILE_CHECK_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!targetProfile) {
    return NextResponse.json(
      { code: "TARGET_PROFILE_NOT_FOUND", error: "Profilo destinatario non trovato" },
      { status: 404 }
    );
  }

  const { data: existingFriendship, error: existingFriendshipError } = await supabase
    .from("friendships")
    .select(FRIENDSHIP_SAFE_SELECT)
    .or(
      `and(user_a.eq.${auth.profileId},user_b.eq.${targetProfileId}),and(user_a.eq.${targetProfileId},user_b.eq.${auth.profileId})`
    )
    .limit(1)
    .maybeSingle<FriendshipDb>();

  if (existingFriendshipError) {
    console.error("Errore verifica amicizia esistente API:", existingFriendshipError);
    return NextResponse.json(
      { code: "FRIENDSHIP_CHECK_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (existingFriendship) {
    return NextResponse.json(
      { code: "ALREADY_FRIENDS", error: "Siete già amici" },
      { status: 409 }
    );
  }

  const { data: existingSentRequest, error: existingSentRequestError } = await supabase
    .from("friendshipRequest")
    .select("id, sender, target, accepted")
    .eq("sender", auth.profileId)
    .eq("target", targetProfileId)
    .is("accepted", null)
    .limit(1)
    .maybeSingle<PendingFriendRequestRow>();

  if (existingSentRequestError) {
    console.error("Errore verifica richiesta già inviata API:", existingSentRequestError);
    return NextResponse.json(
      { code: "FRIEND_REQUEST_CHECK_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (existingSentRequest) {
    return NextResponse.json({
      code: "FRIEND_REQUEST_ALREADY_SENT",
      requestId: existingSentRequest.id,
      targetProfileId,
      friendshipStatus: FRIENDSHIP_STATUS.RICHIESTA_INVIATA,
    });
  }

  const { data: existingReceivedRequest, error: existingReceivedRequestError } =
    await supabase
      .from("friendshipRequest")
      .select("id, sender, target, accepted")
      .eq("sender", targetProfileId)
      .eq("target", auth.profileId)
      .is("accepted", null)
      .limit(1)
      .maybeSingle<PendingFriendRequestRow>();

  if (existingReceivedRequestError) {
    console.error("Errore verifica richiesta ricevuta API:", existingReceivedRequestError);
    return NextResponse.json(
      { code: "FRIEND_REQUEST_CHECK_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (existingReceivedRequest) {
    return NextResponse.json(
      {
        code: "FRIEND_REQUEST_ALREADY_RECEIVED",
        requestId: existingReceivedRequest.id,
        targetProfileId,
        friendshipStatus: FRIENDSHIP_STATUS.RICHIESTA_RICEVUTA,
      },
      { status: 409 }
    );
  }

  const newFriendRequest: FriendshipRequestInsert = {
    sender: auth.profileId,
    target: targetProfileId,
    accepted: null,
  };

  const { data: createdRequest, error: createRequestError } = await supabase
    .from("friendshipRequest")
    .insert(newFriendRequest)
    .select("id, sender, target, accepted")
    .limit(1)
    .single<PendingFriendRequestRow>();

  if (createRequestError) {
    console.error("Errore creazione richiesta amicizia API:", createRequestError);
    return NextResponse.json(
      { code: "FRIEND_REQUEST_CREATE_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const newNotification: NotificationsInsert = {
    activity_from: auth.profileId,
    to: targetProfileId,
    generatedNavigation: `/profile/${encodeURIComponent(auth.profileId)}`,
    notificationType: "friendRequestRecieved",
    seen: false,
  };

  const { error: createNotificationError } = await supabase
    .from("notifications")
    .insert(newNotification);

  if (createNotificationError) {
    console.error(
      "Errore creazione notifica richiesta amicizia API:",
      createNotificationError
    );
    return NextResponse.json(
      { code: "NOTIFICATION_CREATE_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    code: "FRIEND_REQUEST_SENT",
    requestId: createdRequest.id,
    targetProfileId,
    friendshipStatus: FRIENDSHIP_STATUS.RICHIESTA_INVIATA,
  });
}
