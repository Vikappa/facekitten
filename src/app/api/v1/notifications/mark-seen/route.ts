import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";

type MarkSeenBody = {
  notificationId?: unknown;
};

function parseNotificationId(body: unknown): number | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as MarkSeenBody;
  if (typeof candidate.notificationId !== "number") {
    return null;
  }

  if (!Number.isInteger(candidate.notificationId) || candidate.notificationId <= 0) {
    return null;
  }

  return candidate.notificationId;
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

  const notificationId = parseNotificationId(requestBody);
  if (!notificationId) {
    return NextResponse.json(
      { code: "INVALID_NOTIFICATION_ID", error: "notificationId non valido" },
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
      console.error("Errore risoluzione profilo in notifications/mark-seen:", auth.error);
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

  const { data: updatedNotification, error: markSeenError } = await supabase
    .from("notifications")
    .update({ seen: true })
    .eq("id", notificationId)
    .eq("to", auth.profileId)
    .select("id")
    .limit(1)
    .maybeSingle<{ id: number }>();

  if (markSeenError) {
    console.error("Errore mark seen notifica:", markSeenError);
    return NextResponse.json(
      { code: "NOTIFICATION_MARK_SEEN_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!updatedNotification) {
    return NextResponse.json(
      { code: "NOTIFICATION_NOT_FOUND", error: "Notifica non trovata" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    code: "NOTIFICATION_MARKED_SEEN",
    notificationId: updatedNotification.id,
  });
}
