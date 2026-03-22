import { normalizeEmail, verifyProfilePassword } from "@/lib/Security/ProfilePasswordSecurity";
import { issueIdentityCookie, issueSessionCookie } from "@/lib/Security/SessionSecurity";
import { NotificationData } from "@/lib/interfaces/CommonInterfaces";
import { loadUnreadNotificationDtosForProfile } from "@/lib/services/notifications/loadUnreadNotificationDtos";
import { GetLocationById } from "@/lib/services/searchLocation/GetLocationById";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import { Database } from "@/types/database.types";
import { NextRequest, NextResponse } from "next/server";

type LoginBody = {
  email?: string;
  password?: string;
};

type ProfileLoginRow = {
  id: string;
  email: string;
  confirmedAccount: boolean | null;
  password: string | null;
};

type ProfilePreloadRow = {
  id: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  username: string | null;
  bio: string | null;
  dataDiNascita: string | null;
  giocattoloPreferito: string | null;
  locationId: string | null;
  tipoCuccia: Database["public"]["Enums"]["Lettino"] | null;
};

type PreloadMediaData = {
  profilePicture?: string;
  coverPhoto?: string;
  name?: string;
  bio?: string;
  dataDiNascita?: string | null;
  favToy?: string;
  locationName?: string;
  cuccetta?: Database["public"]["Enums"]["Lettino"] | null;
  unreadNotifications?: NotificationData[];
};

const loadProfileMedia = async (profile: ProfilePreloadRow): Promise<PreloadMediaData> => {
  const locationData = profile.locationId
    ? await GetLocationById(profile.locationId)
    : null;

  return {
    profilePicture: profile.avatarUrl ?? undefined,
    coverPhoto: profile.bannerUrl ?? undefined,
    name: profile.username ?? undefined,
    bio: profile.bio ?? undefined,
    dataDiNascita: profile.dataDiNascita ?? null,
    favToy: profile.giocattoloPreferito ?? "",
    locationName: locationData?.descr ?? (profile.locationId ?? ""),
    cuccetta: profile.tipoCuccia ?? null,
  };
};

export async function POST(req: NextRequest) {
  let body: LoginBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_BODY", error: "Body JSON non valido" },
      { status: 400 }
    );
  }

  const email = normalizeEmail(body.email);
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { code: "MISSING_FIELDS", error: "Campi richiesti: email, password" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data: loginProfile, error: profileError } = await supabase
    .from("Profile")
    .select("id, email, confirmedAccount, password")
    .eq("email", email)
    .maybeSingle<ProfileLoginRow>();

  if (profileError) {
    console.error("Errore durante query login:", profileError);
    return NextResponse.json(
      { code: "LOGIN_INTERNAL_ERROR", error: "Errore interno durante il login" },
      { status: 500 }
    );
  }

  if (!loginProfile) {
    return NextResponse.json(
      { code: "INVALID_CREDENTIALS", error: "Credenziali non valide" },
      { status: 401 }
    );
  }

  let isPasswordValid = false;

  if (loginProfile.password) {
    isPasswordValid = await verifyProfilePassword(password, loginProfile.password);
  } else {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    isPasswordValid = !signInError && !!signInData.user;
  }

  if (!isPasswordValid) {
    return NextResponse.json(
      { code: "INVALID_CREDENTIALS", error: "Credenziali non valide" },
      { status: 401 }
    );
  }

  if (loginProfile.confirmedAccount !== true) {
    return NextResponse.json(
      { code: "ACCOUNT_NOT_VERIFIED", error: "Account non verificato" },
      { status: 403 }
    );
  }

  const { data: profile, error: fullProfileError } = await supabase
    .from("Profile")
    .select("id, avatarUrl, bannerUrl, username, bio, dataDiNascita, giocattoloPreferito, locationId, tipoCuccia")
    .eq("id", loginProfile.id)
    .maybeSingle<ProfilePreloadRow>();

  if (fullProfileError || !profile) {
    return NextResponse.json(
      { code: "LOGIN_INTERNAL_ERROR", error: "Errore interno durante il login" },
      { status: 500 }
    );
  }

  const preloadData = await loadProfileMedia(profile);

  const unreadNotificationsResult = await loadUnreadNotificationDtosForProfile({
    profileId: profile.id,
    supabase,
  });

  if (!unreadNotificationsResult.ok) {
    console.error(
      "Errore recupero notifiche non viste in login:",
      unreadNotificationsResult.error
    );
    return NextResponse.json(
      { code: "LOGIN_INTERNAL_ERROR", error: "Errore interno durante il login" },
      { status: 500 }
    );
  }

  const unreadNotifications = unreadNotificationsResult.notifications;

  const response = NextResponse.json({
    code: "LOGIN_OK",
    profileId: profile.id,
    preloadData: {
      ...preloadData,
      unreadNotifications,
    },
  });

  await issueSessionCookie(response, {
    profileId: loginProfile.id,
    email: loginProfile.email,
  });
  await issueIdentityCookie(response, {
    profileId: loginProfile.id,
    email: loginProfile.email,
  });

  return response;
}
