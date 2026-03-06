import type { JWTPayload } from "jose";
import { SignJWT, jwtVerify } from "jose";
import type { NextResponse } from "next/server";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);

export const SESSION_COOKIE_NAME = "fk_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

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

export async function signSession(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify<JWTPayload>(token, SECRET);
  return payload;
}

type SessionIdentity = {
  profileId: string;
  email?: string | null;
};

export async function issueSessionCookie(
  response: NextResponse,
  identity: SessionIdentity
): Promise<string> {
  const token = await signSession({
    sub: identity.profileId,
    ...(identity.email ? { email: identity.email } : {}),
  });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    ...SESSION_COOKIE_OPTIONS,
  });

  return token;
}
