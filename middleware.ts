import {
  IDENTITY_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/Security/SessionSecurity";
import { NextRequest, NextResponse } from "next/server";

const LOGIN_ROUTE = "/login";
const REISSUE_ROUTE = "/login/reissue";
const VERIFY_ROUTE = "/profile/verify";
const DEFAULT_NEXT_PATH = "/";

const PUBLIC_AUTH_ROUTES = new Set([
  "/login",
  "/registration",
  "/accountconfirmation",
]);

const AUTH_ACTION_ROUTES = new Set([
  "/login/request",
  REISSUE_ROUTE,
]);

const ALLOWED_WITHOUT_SESSION = new Set([
  ...PUBLIC_AUTH_ROUTES,
  ...AUTH_ACTION_ROUTES,
  VERIFY_ROUTE,
]);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie =
    request.cookies
      .getAll(SESSION_COOKIE_NAME)
      .some(({ value }) => value.trim().length > 0);
  const hasIdentityCookie =
    request.cookies
      .getAll(IDENTITY_COOKIE_NAME)
      .some(({ value }) => value.trim().length > 0);

  const isAllowedWithoutSession = ALLOWED_WITHOUT_SESSION.has(pathname);
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.has(pathname);

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

  // Middleware edge-side checks only cookie presence.
  // JWT integrity/claims validation is enforced server-side in layouts/routes.
  const isAuthActionRoute = AUTH_ACTION_ROUTES.has(pathname);

  if (
    request.method === "GET" &&
    !hasSessionCookie &&
    hasIdentityCookie &&
    pathname !== REISSUE_ROUTE &&
    !isAuthActionRoute
  ) {
    const reissueUrl = new URL(REISSUE_ROUTE, request.url);
    const defaultNext = `${pathname}${search}`;
    const nextPath = isPublicAuthRoute
      ? normalizeNextPath(request.nextUrl.searchParams.get("next"))
      : normalizeNextPath(defaultNext);

    reissueUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(reissueUrl);
  }

  if (!hasSessionCookie && !isAllowedWithoutSession) {
    const loginUrl = new URL(LOGIN_ROUTE, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Do not redirect away from auth pages in middleware.
  // AuthLayout performs a strong session verification and handles this redirect safely.

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
