import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/Security/SessionSecurity";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}
