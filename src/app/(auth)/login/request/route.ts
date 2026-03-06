import { normalizeEmail, verifyProfilePassword } from "@/lib/Security/ProfilePasswordSecurity";
import {
  issueSessionCookie,
} from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import { NextRequest, NextResponse } from "next/server";
import { Profile } from "@/types/db";

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

interface PreloadMediaData{
    profilePicture: Uint8Array;
    coverPhoto: Uint8Array;
    name?: string;
}

const loadProfileMedia = async (profile: Profile) => {
    const profilePictureUrl = profile.avatarUrl;
    const coverPhotoUrl = profile.bannerUrl;
    const name = profile.username;

    try{
            const payload = {
                profilePicture: profilePictureUrl ? await fetch(profilePictureUrl).then(res => res.arrayBuffer()).then(buffer => new Uint8Array(buffer)) : undefined,
                coverPhoto: coverPhotoUrl ? await fetch(coverPhotoUrl).then(res => res.arrayBuffer()).then(buffer => new Uint8Array(buffer)) : undefined,
                name,
            };
            return payload;
    }catch{
        return {
            profilePicture: undefined,
            coverPhoto: undefined,
            name,
            }
    }
}
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
    console.error("Errore durante query login:", profileError) 
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
    .select("*")
    .eq("id", loginProfile.id)
    .maybeSingle<Profile>();

  if (fullProfileError || !profile) {
    return NextResponse.json(
      { code: "LOGIN_INTERNAL_ERROR", error: "Errore interno durante il login" },
      { status: 500 }
    );
  }

  const preloadData = await loadProfileMedia(profile);

  const response = NextResponse.json({
    code: "LOGIN_OK",
    profileId: profile.id,
    preloadData,
  });

  await issueSessionCookie(response, {
    profileId: loginProfile.id,
    email: loginProfile.email,
  });

  return response;
}
