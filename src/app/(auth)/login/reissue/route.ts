import {
  clearAuthCookies,
  issueIdentityCookie,
  issueSessionCookie,
} from "@/lib/Security/SessionSecurity";
import {
  resolveIdentityCookieFromRequest,
  resolveProfileIdFromSessionIdentity,
  resolveSessionIdentityFromRequest,
} from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import { NextRequest, NextResponse } from "next/server";

type ProfileAuthRow = {
  id: string;
  email: string;
  confirmedAccount: boolean | null;
};

const LOGIN_PATH = "/login";
const VERIFY_PATH = "/profile/verify";
const DEFAULT_NEXT_PATH = "/";

const normalizeNextPath = (rawNext: string | null): string => {
  if (!rawNext) {
    return DEFAULT_NEXT_PATH;
  }

  const normalizedValue = rawNext.trim();
  if (!normalizedValue.startsWith("/") || normalizedValue.startsWith("//")) {
    return DEFAULT_NEXT_PATH;
  }

  return normalizedValue;
};

const createAppRedirectResponse = (
  request: NextRequest,
  nextPath: string
): NextResponse => NextResponse.redirect(new URL(nextPath, request.url), 303);

const createLoginRedirectResponse = (
  request: NextRequest,
  nextPath: string
): NextResponse => {
  const loginUrl = new URL(LOGIN_PATH, request.url);
  if (nextPath !== DEFAULT_NEXT_PATH) {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl, 303);
};

export async function GET(req: NextRequest) {
  const nextPath = normalizeNextPath(req.nextUrl.searchParams.get("next"));
  const supabase = createSupabaseAdminClient();

  const sessionStatus = await resolveSessionIdentityFromRequest(req);
  if (sessionStatus.ok) {
    return createAppRedirectResponse(req, nextPath);
  }

  const identityStatus = await resolveIdentityCookieFromRequest(req);
  if (!identityStatus.ok) {
    const response = createLoginRedirectResponse(req, nextPath);

    if (identityStatus.code !== "SESSION_REQUIRED") {
      clearAuthCookies(response);
    }

    return response;
  }

  const profileIdStatus = await resolveProfileIdFromSessionIdentity(
    identityStatus.identity,
    supabase
  );

  if (!profileIdStatus.ok) {
    const response = createLoginRedirectResponse(req, nextPath);
    clearAuthCookies(response);
    return response;
  }

  const { data: profile, error: profileError } = await supabase
    .from("Profile")
    .select("id, email, confirmedAccount")
    .eq("id", profileIdStatus.profileId)
    .limit(1)
    .maybeSingle<ProfileAuthRow>();

  if (profileError || !profile) {
    const response = createLoginRedirectResponse(req, nextPath);
    clearAuthCookies(response);
    return response;
  }

  if (profile.confirmedAccount !== true) {
    const response = NextResponse.redirect(new URL(VERIFY_PATH, req.url), 303);
    await issueIdentityCookie(response, {
      profileId: profile.id,
      email: profile.email,
    });
    return response;
  }

  const response = createAppRedirectResponse(req, nextPath);
  await issueSessionCookie(response, {
    profileId: profile.id,
    email: profile.email,
  });
  await issueIdentityCookie(response, {
    profileId: profile.id,
    email: profile.email,
  });

  return response;
}
