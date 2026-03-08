import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { NextRequest, NextResponse } from "next/server";

const LOGIN_ROUTE = "/login";
const VERIFY_ROUTE = "/profileregistration/verify";

const PUBLIC_AUTH_ROUTES = new Set([
  "/login",
  "/registration",
  "/accountconfirmation",
]);

const AUTH_ACTION_ROUTES = new Set([
  "/login/request",
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

  const isAllowedWithoutSession = ALLOWED_WITHOUT_SESSION.has(pathname);

  // Middleware edge-side checks only cookie presence.
  // JWT integrity/claims validation is enforced server-side in layouts/routes.
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
