import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { code: "NOT_IMPLEMENTED", error: "Endpoint non ancora implementato" },
    { status: 501 }
  );
}
