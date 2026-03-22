import type { JWTPayload } from "jose";
import { SignJWT, jwtVerify } from "jose";
import type { NextResponse } from "next/server";

const SESSION_SECRET_VALUE = process.env.SESSION_SECRET;

if (!SESSION_SECRET_VALUE) {
  throw new Error("SESSION_SECRET env var mancante");
}

const SESSION_SECRET = new TextEncoder().encode(SESSION_SECRET_VALUE);
const IDENTITY_SECRET = new TextEncoder().encode(
  process.env.IDENTITY_TOKEN_SECRET?.trim() || SESSION_SECRET_VALUE
);

export const SESSION_COOKIE_NAME = "fk_session";
export const IDENTITY_COOKIE_NAME = "fk_identity";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const IDENTITY_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const COOKIE_DOMAIN = process.env.SESSION_COOKIE_DOMAIN?.trim();

const normalizeSameSite = (value?: string): "lax" | "strict" | "none" => {
  if (!value) {
    return "lax";
  }

  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === "strict" || normalizedValue === "none") {
    return normalizedValue;
  }

  return "lax";
};

const COOKIE_SAME_SITE = normalizeSameSite(process.env.SESSION_COOKIE_SAME_SITE);

const createCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: COOKIE_SAME_SITE,
  path: "/",
  ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  maxAge,
});

export const SESSION_COOKIE_OPTIONS = createCookieOptions(SESSION_MAX_AGE_SECONDS);
export const IDENTITY_COOKIE_OPTIONS = createCookieOptions(IDENTITY_MAX_AGE_SECONDS);

const readStringClaim = (payload: JWTPayload, key: string): string | undefined => {
  const value = (payload as Record<string, unknown>)[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const extractSessionIdentity = (
  payload: JWTPayload
): { profileId?: string; email?: string } => {
  const profileId =
    payload.sub ??
    readStringClaim(payload, "userId") ??
    readStringClaim(payload, "uid") ??
    readStringClaim(payload, "id") ??
    readStringClaim(payload, "profileId");

  const email = readStringClaim(payload, "email");

  return { profileId, email };
};

async function signToken(payload: JWTPayload, secret: Uint8Array, ttl: string) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

async function verifyToken(token: string, secret: Uint8Array) {
  const { payload } = await jwtVerify<JWTPayload>(token, secret);
  return payload;
}

export async function signSession(payload: JWTPayload) {
  return signToken(payload, SESSION_SECRET, "7d");
}

export async function signIdentityToken(payload: JWTPayload) {
  return signToken(payload, IDENTITY_SECRET, "30d");
}

export async function verifySession(token: string) {
  return verifyToken(token, SESSION_SECRET);
}

export async function verifyIdentityToken(token: string) {
  return verifyToken(token, IDENTITY_SECRET);
}

type SessionIdentity = {
  profileId: string;
  email?: string | null;
};

const createTokenPayloadFromIdentity = (identity: SessionIdentity): JWTPayload => ({
  sub: identity.profileId,
  ...(identity.email ? { email: identity.email } : {}),
});

export async function issueSessionCookie(
  response: NextResponse,
  identity: SessionIdentity
): Promise<string> {
  const token = await signSession(createTokenPayloadFromIdentity(identity));

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    ...SESSION_COOKIE_OPTIONS,
  });

  return token;
}

export async function issueIdentityCookie(
  response: NextResponse,
  identity: SessionIdentity
): Promise<string> {
  const token = await signIdentityToken(createTokenPayloadFromIdentity(identity));

  response.cookies.set({
    name: IDENTITY_COOKIE_NAME,
    value: token,
    ...IDENTITY_COOKIE_OPTIONS,
  });

  return token;
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });

  response.cookies.set({
    name: IDENTITY_COOKIE_NAME,
    value: "",
    ...IDENTITY_COOKIE_OPTIONS,
    maxAge: 0,
  });
}
