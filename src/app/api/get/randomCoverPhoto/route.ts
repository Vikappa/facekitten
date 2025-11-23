import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { coverPhotoIndexes } from "../../../../../public/storedcatcoverphotos/coverPhotoIndexes";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("fk_session")?.value;
  if (!sessionId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = coverPhotoIndexes[Math.floor(Math.random() * coverPhotoIndexes.length)]

  return NextResponse.json({ url });
}
