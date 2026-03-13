import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  verifySession,
  extractSessionIdentity,
} from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { ProfileUpdate } from "@/types/db";
import type { Lettino } from "@/types/db.generated";

type ProfileIdentityRow = {
  id: string;
};

type SetProfileBody = {
  username?: string;
  bio?: string | null;
  location_id?: string | null;
  favToy?: string | null;
  dataDiNascita?: string | null;
  tipoCuccia?: Lettino | null;
};

type ProfileUpdateInput = ProfileUpdate;

type UpdatedProfileRow = {
  id: string;
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

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const LETTINO_OPTIONS = new Set<Lettino>([
  "Cuccia",
  "Scatola",
  "Cassetto dei calzini (scassinato)",
  "Strada",
  "Letto di umano (ospite)",
  "Letto di umano (espropriato)",
  "Divano",
  "Sedia",
  "Poltrona",
]);

function isLettino(value: string): value is Lettino {
  return LETTINO_OPTIONS.has(value as Lettino);
}

function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE_REGEX.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function parseUpdateBody(body: unknown): ProfileUpdateInput | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as Partial<SetProfileBody>;
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

  if (candidate.location_id !== undefined) {
    if (candidate.location_id === null) {
      updateInput.locationId = null;
    } else if (typeof candidate.location_id === "string") {
      const normalizedLocationId = candidate.location_id.trim();
      updateInput.locationId =
        normalizedLocationId.length > 0 ? normalizedLocationId : null;
    } else {
      return null;
    }
  }

  if (candidate.favToy !== undefined) {
    if (candidate.favToy === null) {
      updateInput.giocattoloPreferito = null;
    } else if (typeof candidate.favToy === "string") {
      const normalizedFavToy = candidate.favToy.trim();
      updateInput.giocattoloPreferito =
        normalizedFavToy.length > 0 ? normalizedFavToy : null;
    } else {
      return null;
    }
  }

  if (candidate.dataDiNascita !== undefined) {
    if (candidate.dataDiNascita === null) {
      updateInput.dataDiNascita = null;
    } else if (typeof candidate.dataDiNascita === "string") {
      const normalizedBirthDate = candidate.dataDiNascita.trim();

      if (normalizedBirthDate.length === 0) {
        updateInput.dataDiNascita = null;
      } else if (isValidIsoDate(normalizedBirthDate)) {
        updateInput.dataDiNascita = normalizedBirthDate;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  if (candidate.tipoCuccia !== undefined) {
    if (candidate.tipoCuccia === null) {
      updateInput.tipoCuccia = null;
    } else if (typeof candidate.tipoCuccia === "string" && isLettino(candidate.tipoCuccia)) {
      updateInput.tipoCuccia = candidate.tipoCuccia;
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
      const response = NextResponse.redirect(new URL("/login", req.url), 303);
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        ...SESSION_COOKIE_OPTIONS,
        maxAge: 0,
      });
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
    .select(
      "id, username, avatarUrl, bannerUrl, bio, confirmedAccount, dataDiNascita, giocattoloPreferito, locationId, tipoCuccia"
    )
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
      dataDiNascita: updatedProfile.dataDiNascita,
      favToy: updatedProfile.giocattoloPreferito,
      location_id: updatedProfile.locationId,
      tipoCuccia: updatedProfile.tipoCuccia,
    },
  });
}
