import { verifySession } from "@/lib/Security/SessionSecurity";
import { NextRequest, NextResponse } from "next/server";

const LOGIN_ROUTE = "/login";
const HOME_ROUTE = "/";
const VERIFY_ROUTE = "/profileregistration/verify";

const PUBLIC_AUTH_ROUTES = new Set([
  "/login",
  "/registration",
  "/accountconfirmation",
]);

const ALLOWED_WITHOUT_SESSION = new Set([...PUBLIC_AUTH_ROUTES, VERIFY_ROUTE]);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionToken = request.cookies.get("fk_session")?.value;
  let hasSession = false;

  if (sessionToken) {
    try {
      await verifySession(sessionToken);
      hasSession = true;
    } catch {
      hasSession = false;
    }
  }

  const isAllowedWithoutSession = ALLOWED_WITHOUT_SESSION.has(pathname);

  if (!hasSession && !isAllowedWithoutSession) {
    const loginUrl = new URL(LOGIN_ROUTE, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    if (sessionToken) {
      response.cookies.delete("fk_session");
    }
    return response;
  }

  if (hasSession && PUBLIC_AUTH_ROUTES.has(pathname)) {
    return NextResponse.redirect(new URL(HOME_ROUTE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
