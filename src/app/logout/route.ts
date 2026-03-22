import { clearAuthCookies } from "@/lib/Security/SessionSecurity";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ code: "LOGOUT_OK" });
  clearAuthCookies(response);

  return response;
}

export async function GET(request: Request) {
  // GET must remain side-effect free to avoid accidental logout due to prefetch.
  return NextResponse.redirect(new URL("/login", request.url));
}
