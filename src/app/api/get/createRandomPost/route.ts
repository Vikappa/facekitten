import { FaceKittenDB, IProfile } from "@/lib/db";
import { CreateSinglePost } from "@/lib/factories/post/postGenerator";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("fk_session")?.value;

    if (!sessionId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let body: { author?: IProfile };

    try {
        body = await request.json();
    } catch {
        return new NextResponse("Invalid JSON body", { status: 400 });
    }

    const author = body.author;

    if (!author) {
        return new NextResponse("Missing author in body", { status: 400 });
    }

    // Qui puoi aggiungere eventuali validazioni sull'oggetto author
    const postResponse = CreateSinglePost(author);

    return NextResponse.json(postResponse);
}