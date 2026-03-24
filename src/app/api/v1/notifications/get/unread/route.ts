import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import { loadUnreadNotificationDtosForProfile } from "@/lib/services/notifications/loadUnreadNotificationDtos";

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
      console.error("Errore risoluzione profilo in notifications/get/unread:", auth.error);
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

  const unreadNotificationsResult = await loadUnreadNotificationDtosForProfile({
    profileId: auth.profileId,
    supabase,
    limit: 100,
  });

  if (!unreadNotificationsResult.ok) {
    console.error(
      "Errore recupero notifiche non viste in notifications/get/unread:",
      unreadNotificationsResult.error
    );
    return NextResponse.json(
      { code: "UNREAD_NOTIFICATIONS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    unreadNotifications: unreadNotificationsResult.notifications,
  });
}
