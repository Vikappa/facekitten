import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import {
  SESSION_COOKIE_NAME,
  verifySession,
  extractSessionIdentity,
} from "@/lib/Security/SessionSecurity";
import type { Lettino } from "@/types/db.generated";

type ProfileEditPayload = {
  username: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  confirmedAccount: boolean | null;
  dataDiNascita: string | null;
  favToy: string | null;
  location_id: string | null;
  tipoCuccia: Lettino | null;
};

type ProfileEditRow = {
  username: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  confirmedAccount: boolean | null;
  dataDiNascita: string | null;
  giocattoloPreferito: string | null;
  locationId: string | null;
  tipoCuccia: Lettino | null;
};

export async function GET(req: NextRequest) {
  const sessionTokens = req.cookies
    .getAll(SESSION_COOKIE_NAME)
    .map(({ value }) => value.trim())
    .filter((value) => value.length > 0);

  if (sessionTokens.length === 0) {
    return NextResponse.json(
      { code: "SESSION_REQUIRED", error: "Sessione mancante" },
      { status: 401 }
    );
  }

  let payload: Awaited<ReturnType<typeof verifySession>> | null = null;

  for (const sessionToken of sessionTokens) {
    try {
      payload = await verifySession(sessionToken);
      break;
    } catch {
    const response = NextResponse.json(
      { code: "INVALID_SESSION", error: "Sessione non verificata" },
      { status: 401 }
    );
    return response; 
   }
  }

  if (!payload) {
    const response = NextResponse.json(
      { code: "INVALID_SESSION", error: "Sessione non valida" },
      { status: 401 }
    );
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  const { profileId: tokenProfileId, email } = extractSessionIdentity(payload);

  if (!tokenProfileId && !email) {
    return NextResponse.json(
      { code: "INVALID_SESSION_IDENTITY", error: "Sessione non valida" },
      { status: 401 }
    );
  }

  const supabase = createSupabaseAdminClient();

  let profileQuery = supabase
    .from("Profile")
    .select(
      "username, avatarUrl, bannerUrl, bio, confirmedAccount, dataDiNascita, giocattoloPreferito, locationId, tipoCuccia"
    )
    .limit(1);

  if (tokenProfileId) {
    profileQuery = profileQuery.eq("id", tokenProfileId);
  } else if (email) {
    profileQuery = profileQuery.eq("email", email);
  }

  const { data: profile, error: profileError } =
    await profileQuery.maybeSingle<ProfileEditRow>();

  if (profileError) {
    console.error("Errore durante il recupero profilo per modifica:", profileError);
    return NextResponse.json(
      { code: "PROFILE_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!profile) {
    return NextResponse.json(
      { code: "PROFILE_NOT_FOUND", error: "Profilo non trovato" },
      { status: 404 }
    );
  }

  const profileEditPayload: ProfileEditPayload = {
    username: profile.username ?? "",
    avatarUrl: profile.avatarUrl,
    bannerUrl: profile.bannerUrl,
    bio: profile.bio,
    confirmedAccount: profile.confirmedAccount,
    dataDiNascita: profile.dataDiNascita,
    favToy: profile.giocattoloPreferito,
    location_id: profile.locationId,
    tipoCuccia: profile.tipoCuccia,
  };

  return NextResponse.json({
    code: "PROFILE_DATA_OK",
    profile: profileEditPayload,
  });
}
