import "server-only";

import type { JWTPayload } from "jose";
import type { NextRequest } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import {
  SESSION_COOKIE_NAME,
  extractSessionIdentity,
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

function getRequestSessionTokens(req: Pick<NextRequest, "cookies">): string[] {
  return req.cookies
    .getAll(SESSION_COOKIE_NAME)
    .map(({ value }) => value.trim())
    .filter((value) => value.length > 0);
}

export async function resolveSessionIdentityFromToken(
  sessionToken: string
): Promise<
  | SessionIdentitySuccess
  | {
      ok: false;
      code: "INVALID_SESSION" | "INVALID_SESSION_IDENTITY";
    }
> {
  const normalizedToken = sessionToken.trim();
  if (normalizedToken.length === 0) {
    return { ok: false, code: "INVALID_SESSION" };
  }

  let payload: JWTPayload;

  try {
    payload = await verifySession(normalizedToken);
  } catch {
    return { ok: false, code: "INVALID_SESSION" };
  }

  const identity = extractSessionIdentity(payload);

  if (!identity.profileId && !identity.email) {
    return { ok: false, code: "INVALID_SESSION_IDENTITY" };
  }

  return { ok: true, payload, identity };
}

export async function resolveSessionIdentityFromRequest(
  req: Pick<NextRequest, "cookies">
): Promise<SessionIdentityResult> {
  const sessionTokens = getRequestSessionTokens(req);

  if (sessionTokens.length === 0) {
    return { ok: false, code: "SESSION_REQUIRED" };
  }

  let hasInvalidIdentity = false;

  for (const sessionToken of sessionTokens) {
    const sessionResult = await resolveSessionIdentityFromToken(sessionToken);
    if (sessionResult.ok) {
      return sessionResult;
    }

    if (sessionResult.code === "INVALID_SESSION_IDENTITY") {
      hasInvalidIdentity = true;
    }
  }

  if (hasInvalidIdentity) {
    return { ok: false, code: "INVALID_SESSION_IDENTITY" };
  }

  return { ok: false, code: "INVALID_SESSION" };
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
