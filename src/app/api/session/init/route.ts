import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { signSession, verifySession } from "@/lib/Security/SessionVerify";


export async function GET() {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get("fk_session")?.value;

  if (existingToken) {
    try {
      await verifySession(existingToken);
      return NextResponse.json({ ok: true, hadToken: true });
    } catch {
      return NextResponse.json({ ok: false, hadToken: false }, { status: 401 });
    }
  }

  const payload = {
    sid: crypto.randomUUID(),
  };

  const token = await signSession(payload);

  const res = NextResponse.json({ ok: true, hadToken: false });
  res.cookies.set("fk_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return res;
}