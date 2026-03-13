import { SearchLocation } from "@/lib/services/searchLocation/SearchLocation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get("q")?.trim();

    if (!query) {
        return NextResponse.json({ error: "Missing query parameter: q" }, { status: 400 });
    }

    const loc = await SearchLocation(query);
    if (!loc) {
        return NextResponse.json({ error: "Errore nella richiesta location search" }, { status: 502 });
    }

    return NextResponse.json(loc);
}
