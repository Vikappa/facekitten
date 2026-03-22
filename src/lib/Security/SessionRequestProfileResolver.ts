import "server-only";

import type { JWTPayload } from "jose";
import type { NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import {
  IDENTITY_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  extractSessionIdentity,
  verifyIdentityToken,
  verifySession,
} from "./SessionSecurity";

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

export type SessionIdentity = {
  profileId?: string;
  email?: string;
};

type SessionIdentityFailureCode =
  | "SESSION_REQUIRED"
  | "INVALID_SESSION"
  | "INVALID_SESSION_IDENTITY";

type SessionIdentityFailure = {
  ok: false;
  code: SessionIdentityFailureCode;
};

type SessionIdentitySuccess = {
  ok: true;
  payload: JWTPayload;
  identity: SessionIdentity;
};

export type SessionIdentityResult = SessionIdentitySuccess | SessionIdentityFailure;

type ProfileIdFailureCode = "PROFILE_RESOLUTION_ERROR" | "PROFILE_NOT_FOUND";

type ProfileIdFailure = {
  ok: false;
  code: ProfileIdFailureCode;
  error?: unknown;
};

type ProfileIdSuccess = {
  ok: true;
  profileId: string;
};

export type ProfileIdResult = ProfileIdSuccess | ProfileIdFailure;

export type AuthenticatedProfileIdResult =
  | {
      ok: true;
      payload: JWTPayload;
      identity: SessionIdentity;
      profileId: string;
    }
  | SessionIdentityFailure
  | ProfileIdFailure;

function getRequestTokens(
  req: Pick<NextRequest, "cookies">,
  cookieName: string
): string[] {
  return req.cookies
    .getAll(cookieName)
    .map(({ value }) => value.trim())
    .filter((value) => value.length > 0);
}

type ResolveTokenIdentityResult =
  | SessionIdentitySuccess
  | {
      ok: false;
      code: "INVALID_SESSION" | "INVALID_SESSION_IDENTITY";
    };

async function resolveIdentityFromToken(
  token: string,
  verifyToken: (token: string) => Promise<JWTPayload>
): Promise<ResolveTokenIdentityResult> {
  const normalizedToken = token.trim();
  if (normalizedToken.length === 0) {
    return { ok: false, code: "INVALID_SESSION" };
  }

  let payload: JWTPayload;

  try {
    payload = await verifyToken(normalizedToken);
  } catch {
    return { ok: false, code: "INVALID_SESSION" };
  }

  const identity = extractSessionIdentity(payload);

  if (!identity.profileId && !identity.email) {
    return { ok: false, code: "INVALID_SESSION_IDENTITY" };
  }

  return { ok: true, payload, identity };
}

export async function resolveSessionIdentityFromToken(
  sessionToken: string
): Promise<ResolveTokenIdentityResult> {
  return resolveIdentityFromToken(sessionToken, verifySession);
}

export async function resolveIdentityCookieFromToken(
  identityToken: string
): Promise<ResolveTokenIdentityResult> {
  return resolveIdentityFromToken(identityToken, verifyIdentityToken);
}

async function resolveIdentityFromRequest(
  req: Pick<NextRequest, "cookies">,
  cookieName: string,
  resolveFromToken: (token: string) => Promise<ResolveTokenIdentityResult>
): Promise<SessionIdentityResult> {
  const tokens = getRequestTokens(req, cookieName);

  if (tokens.length === 0) {
    return { ok: false, code: "SESSION_REQUIRED" };
  }

  let hasInvalidIdentity = false;

  for (const token of tokens) {
    const identityResult = await resolveFromToken(token);
    if (identityResult.ok) {
      return identityResult;
    }

    if (identityResult.code === "INVALID_SESSION_IDENTITY") {
      hasInvalidIdentity = true;
    }
  }

  if (hasInvalidIdentity) {
    return { ok: false, code: "INVALID_SESSION_IDENTITY" };
  }

  return { ok: false, code: "INVALID_SESSION" };
}

export async function resolveSessionIdentityFromRequest(
  req: Pick<NextRequest, "cookies">
): Promise<SessionIdentityResult> {
  return resolveIdentityFromRequest(
    req,
    SESSION_COOKIE_NAME,
    resolveSessionIdentityFromToken
  );
}

export async function resolveIdentityCookieFromRequest(
  req: Pick<NextRequest, "cookies">
): Promise<SessionIdentityResult> {
  return resolveIdentityFromRequest(
    req,
    IDENTITY_COOKIE_NAME,
    resolveIdentityCookieFromToken
  );
}

export async function resolveProfileIdFromSessionIdentity(
  identity: SessionIdentity,
  supabaseClient?: SupabaseAdminClient
): Promise<ProfileIdResult> {
  const supabase = supabaseClient ?? createSupabaseAdminClient();
  let profileQuery = supabase.from("Profile").select("id").limit(1);

  if (identity.profileId) {
    profileQuery = profileQuery.eq("id", identity.profileId);
  } else if (identity.email) {
    profileQuery = profileQuery.eq("email", identity.email);
  } else {
    return { ok: false, code: "PROFILE_NOT_FOUND" };
  }

  const { data: profile, error } = await profileQuery.maybeSingle<{ id: string }>();

  if (error) {
    return { ok: false, code: "PROFILE_RESOLUTION_ERROR", error };
  }

  if (!profile) {
    return { ok: false, code: "PROFILE_NOT_FOUND" };
  }

  return { ok: true, profileId: profile.id };
}

export async function resolveAuthenticatedProfileIdFromRequest(
  req: Pick<NextRequest, "cookies">,
  supabaseClient?: SupabaseAdminClient
): Promise<AuthenticatedProfileIdResult> {
  const sessionIdentityResult = await resolveSessionIdentityFromRequest(req);

  if (!sessionIdentityResult.ok) {
    return sessionIdentityResult;
  }

  const profileResult = await resolveProfileIdFromSessionIdentity(
    sessionIdentityResult.identity,
    supabaseClient
  );

  if (!profileResult.ok) {
    return profileResult;
  }

  return {
    ok: true,
    payload: sessionIdentityResult.payload,
    identity: sessionIdentityResult.identity,
    profileId: profileResult.profileId,
  };
}
