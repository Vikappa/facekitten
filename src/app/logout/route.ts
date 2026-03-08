import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/Security/SessionSecurity";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ code: "LOGOUT_OK" });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}

export async function GET(request: Request) {
  // GET must remain side-effect free to avoid accidental logout due to prefetch.
  return NextResponse.redirect(new URL("/login", request.url));
}
