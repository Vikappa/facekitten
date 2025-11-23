import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { postImgIndexes } from "../../../../../public/storedcatphotos/imgs/postImgIndexes";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("fk_session")?.value;
  if (!sessionId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = postImgIndexes[Math.floor(Math.random() * postImgIndexes.length)]

  return NextResponse.json({ url });
}
