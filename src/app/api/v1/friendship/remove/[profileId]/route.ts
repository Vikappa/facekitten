import {
  resolveAuthenticatedProfileIdFromRequest,
  type AuthenticatedProfileIdResult,
} from "@/lib/Security/SessionRequestProfileResolver";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import { FRIENDSHIP_SAFE_SELECT, type FriendshipDb } from "@/types/db";
import { FRIENDSHIP_STATUS } from "@/types/friendship";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ profileId?: string }> | { profileId?: string };
};

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
    console.error("Errore risoluzione profilo rimozione amicizia API:", auth.error);
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

export async function DELETE(req: NextRequest, context: RouteContext) {
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
      { code: "CANNOT_REMOVE_SELF", error: "Non puoi rimuoverti dagli amici" },
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
      "Errore verifica profilo destinatario rimozione amicizia API:",
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

  const friendshipFilter = `and(user_a.eq.${auth.profileId},user_b.eq.${targetProfileId}),and(user_a.eq.${targetProfileId},user_b.eq.${auth.profileId})`;

  const { data: existingFriendship, error: existingFriendshipError } = await supabase
    .from("friendships")
    .select(FRIENDSHIP_SAFE_SELECT)
    .or(friendshipFilter)
    .limit(1)
    .maybeSingle<FriendshipDb>();

  if (existingFriendshipError) {
    console.error("Errore verifica amicizia da rimuovere API:", existingFriendshipError);
    return NextResponse.json(
      { code: "FRIENDSHIP_CHECK_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!existingFriendship) {
    return NextResponse.json({
      code: "FRIENDSHIP_ALREADY_REMOVED",
      targetProfileId,
      friendshipStatus: FRIENDSHIP_STATUS.NON_AMICO,
    });
  }

  const { error: removeFriendshipError } = await supabase
    .from("friendships")
    .delete()
    .or(friendshipFilter);

  if (removeFriendshipError) {
    console.error("Errore rimozione amicizia API:", removeFriendshipError);
    return NextResponse.json(
      { code: "FRIENDSHIP_REMOVE_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    code: "FRIEND_REMOVED",
    targetProfileId,
    friendshipStatus: FRIENDSHIP_STATUS.NON_AMICO,
  });
}
