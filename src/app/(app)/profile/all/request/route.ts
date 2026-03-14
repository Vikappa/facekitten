import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type {
  FriendshipRequestInsert,
  FriendshipRequestRow,
} from "@/types/db.generated";
import { FRIENDSHIP_SAFE_SELECT, type FriendshipDb } from "@/types/db";
import { NextRequest, NextResponse } from "next/server";

type SendFriendRequestBody = {
  targetProfileId?: string;
};

type PendingFriendRequestRow = {
  sender: FriendshipRequestRow["sender"];
  target: FriendshipRequestRow["target"];
  accepted: FriendshipRequestRow["accepted"];
};

function parseTargetProfileId(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const candidate = payload as SendFriendRequestBody;
  if (typeof candidate.targetProfileId !== "string") {
    return null;
  }

  const normalizedTargetProfileId = candidate.targetProfileId.trim();
  return normalizedTargetProfileId.length > 0 ? normalizedTargetProfileId : null;
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

  const targetProfileId = parseTargetProfileId(requestBody);
  if (!targetProfileId) {
    return NextResponse.json(
      { code: "INVALID_TARGET_PROFILE_ID", error: "Target profilo non valido" },
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
      console.error("Errore risoluzione profilo invio richiesta amicizia:", auth.error);
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
    .maybeSingle<{ id: string }>();

  if (targetProfileError) {
    console.error("Errore verifica profilo destinatario richiesta:", targetProfileError);
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
    console.error("Errore verifica amicizia esistente:", existingFriendshipError);
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

  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("friendshipRequest")
    .select("sender, target, accepted")
    .eq("sender", auth.profileId)
    .eq("target", targetProfileId)
    .is("accepted", null)
    .limit(1)
    .maybeSingle<PendingFriendRequestRow>();

  if (existingRequestError) {
    console.error("Errore verifica richiesta già inviata:", existingRequestError);
    return NextResponse.json(
      { code: "FRIEND_REQUEST_CHECK_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (existingRequest) {
    return NextResponse.json({
      code: "FRIEND_REQUEST_ALREADY_SENT",
      targetProfileId,
      friendshipStatus: "richiesta_inviata" as const,
    });
  }

  const newFriendRequest: FriendshipRequestInsert = {
    sender: auth.profileId,
    target: targetProfileId,
    accepted: null,
  };

  const { error: createRequestError } = await supabase
    .from("friendshipRequest")
    .insert(newFriendRequest);

  if (createRequestError) {
    console.error("Errore creazione richiesta amicizia:", createRequestError);
    return NextResponse.json(
      { code: "FRIEND_REQUEST_CREATE_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    code: "FRIEND_REQUEST_SENT",
    targetProfileId,
    friendshipStatus: "richiesta_inviata" as const,
  });
}
