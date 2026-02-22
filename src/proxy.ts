import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "./lib/Security/SessionVerify";

const isApi = (pathname: string) => pathname.startsWith("/api/");
const isHardcodedCatsApi = (pathname: string) => pathname.startsWith("/api/hardcodedcats/");
const isPublic = (pathname: string) => pathname === "/" || pathname === "/api/session/init";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug: tienilo finché non sei sicuro che sta girando in produzione
  console.log("PROXY HIT:", pathname);

  // 1) Public routes: sempre ok
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // 2) Hardcodedcats API: auth server-to-server (Bearer secret). NO redirect.
  if (isHardcodedCatsApi(pathname)) {
    const secret = (process.env.FACEKITTEN_SECRET || "").trim();
    if (!secret) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured: FACEKITTEN_SECRET missing" },
        { status: 500 }
      );
    }

    const auth = (request.headers.get("authorization") || "").trim();
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  // 3) Altre API: MAI redirect HTML. Se manca sessione → 401 JSON
  if (isApi(pathname)) {
    const token = request.cookies.get("fk_session")?.value;
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
      await verifySession(token);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  // 4) Pagine normali: sessione richiesta → redirect a "/"
  const token = request.cookies.get("fk_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    await verifySession(token);
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 5) Security headers (per navigazione “normale”)
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

// Limito il proxy alle vere route dell'app, non ai file statici
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.ico|sw.js|manifest.webmanifest|robots.txt|sitemap.xml|img/).*)",
  ],
};