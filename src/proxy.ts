import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "./lib/Security/SessionVerify";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("fk_session")?.value;
  const { pathname } = request.nextUrl;

  const FACEKITTEN_SECRET= process.env.FACEKITTEN_SECRET;

  const isPublic =
    pathname === "/" ||
    pathname === "/api/session/init";

const isPazuzuTryChat = pathname.startsWith("/api/hardcodedcats/");
  // Le public le lasciamo sempre passare
  if (isPublic) {
    return NextResponse.next();
  }
      console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    console.log(request)
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")

  if(isPazuzuTryChat) {
    // request.headers.get

    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token) {
    try {
      await verifySession(token)
    } catch {
      if (!isPublic) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }


  // 2) Lascio proseguire la richiesta
  const response = NextResponse.next();

  // 4) Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

// Limito il proxy alle vere route dell'app, non ai file statici
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.ico|img/).*)",
  ],
};
