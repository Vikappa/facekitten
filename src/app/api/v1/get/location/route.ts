import { GetLocationById } from "@/lib/services/searchLocation/GetLocationById";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("q")?.trim();

  if (!placeId) {
    return NextResponse.json({ error: "Missing query parameter: q" }, { status: 400 });
  }

  const location = await GetLocationById(placeId);
  if (!location) {
    return NextResponse.json({ error: "Errore nella richiesta location" }, { status: 502 });
  }

  return NextResponse.json(location);
}
