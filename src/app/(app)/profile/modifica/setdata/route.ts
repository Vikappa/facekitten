import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySession,
  extractSessionIdentity,
} from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";

type ProfileIdentityRow = {
  id: string;
};

type SetProfileBody = {
  username?: unknown;
  bio?: unknown;
};

type ProfileUpdateInput = {
  username?: string;
  bio?: string | null;
};

type UpdatedProfileRow = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  confirmedAccount: boolean | null;
};

function parseUpdateBody(body: unknown): ProfileUpdateInput | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as SetProfileBody;
  const updateInput: ProfileUpdateInput = {};

  if (candidate.username !== undefined) {
    if (typeof candidate.username !== "string") {
      return null;
    }

    const normalizedUsername = candidate.username.trim();
    if (normalizedUsername.length === 0) {
      return null;
    }

    updateInput.username = normalizedUsername;
  }

  if (candidate.bio !== undefined) {
    if (candidate.bio === null) {
      updateInput.bio = null;
    } else if (typeof candidate.bio === "string") {
      const normalizedBio = candidate.bio.trim();
      updateInput.bio = normalizedBio.length > 0 ? normalizedBio : null;
    } else {
      return null;
    }
  }

  return Object.keys(updateInput).length > 0 ? updateInput : null;
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

  const profileUpdateInput = parseUpdateBody(requestBody);
  if (!profileUpdateInput) {
    return NextResponse.json(
      { code: "INVALID_PROFILE_UPDATE_INPUT", error: "Campi aggiornamento non validi" },
      { status: 400 }
    );
  }

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
      // Prova il prossimo token in caso di cookie duplicati.
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
  let profileQuery = supabase.from("Profile").select("id").limit(1);

  if (tokenProfileId) {
    profileQuery = profileQuery.eq("id", tokenProfileId);
  } else if (email) {
    profileQuery = profileQuery.eq("email", email);
  }

  const { data: profileIdentity, error: profileIdentityError } =
    await profileQuery.maybeSingle<ProfileIdentityRow>();

  if (profileIdentityError) {
    console.error(
      "Errore durante la risoluzione del profilo da sessione:",
      profileIdentityError
    );
    return NextResponse.json(
      { code: "PROFILE_RESOLUTION_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!profileIdentity) {
    return NextResponse.json(
      { code: "PROFILE_NOT_FOUND", error: "Profilo non trovato" },
      { status: 404 }
    );
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from("Profile")
    .update(profileUpdateInput)
    .eq("id", profileIdentity.id)
    .select("id, username, avatarUrl, bannerUrl, bio, confirmedAccount")
    .single<UpdatedProfileRow>();

  if (updateError || !updatedProfile) {
    console.error("Errore durante update dati profilo:", updateError);
    return NextResponse.json(
      { code: "UPDATE_PROFILE_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    code: "PROFILE_UPDATED",
    profileId: updatedProfile.id,
    profile: {
      username: updatedProfile.username ?? "",
      avatarUrl: updatedProfile.avatarUrl,
      bannerUrl: updatedProfile.bannerUrl,
      bio: updatedProfile.bio,
      confirmedAccount: updatedProfile.confirmedAccount,
    },
  });
}
