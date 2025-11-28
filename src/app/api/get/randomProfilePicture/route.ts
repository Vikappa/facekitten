import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { picIndexes } from "../../../../../public/storedcatprofilepictures/imgs/fileindexer";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("fk_session")?.value;
  if (!sessionId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = picIndexes[Math.floor(Math.random() * picIndexes.length)]

  return NextResponse.json({ url });
}
