import { newResume } from "@/lib/factories/randomnews/randomNews";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("fk_session")?.value;
    if (!sessionId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const news = await newResume()
    return NextResponse.json(news)
}