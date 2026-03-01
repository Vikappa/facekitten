import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchMissingVipProfiles } from "@/lib/factories/profile/VipCatProfiles";


export async function POST(req: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("fk_session")?.value;

  if (!sessionId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  
  const { currentProfiles } = await req.json();
  const VipProfiles = await fetchMissingVipProfiles(currentProfiles);
    debugger


  return NextResponse.json(VipProfiles);
}
