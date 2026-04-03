import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";

const USER_IMAGES_BUCKET = "FacekittenProfilePictures";
const USER_IMAGES_ROOT_PATH = "public";
const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 200;

export type UserImageDto = {
  name: string;
  path: string;
  url: string;
  createdAt: string | null;
  updatedAt: string | null;
};

function parseLimit(rawLimit: string | null): number {
  if (!rawLimit) {
    return DEFAULT_LIST_LIMIT;
  }

  const parsed = Number.parseInt(rawLimit, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIST_LIMIT;
  }

  return Math.min(parsed, MAX_LIST_LIMIT);
}

function isOwnedImageFile(fileName: string, profileId: string): boolean {
  return fileName.startsWith(`${profileId}-`);
}

export async function GET(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  const auth = await resolveAuthenticatedProfileIdFromRequest(req, supabase);

  if (!auth.ok) {
    if (auth.code === "SESSION_REQUIRED") {
      return NextResponse.json(
        { code: "SESSION_REQUIRED", error: "Sessione mancante" },
        { status: 401 }
      );
    }

    if (auth.code === "INVALID_SESSION") {
      const res = NextResponse.json(
        { code: "INVALID_SESSION", error: "Sessione non valida" },
        { status: 401 }
      );
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }

    if (auth.code === "INVALID_SESSION_IDENTITY") {
      return NextResponse.json(
        { code: "INVALID_SESSION_IDENTITY", error: "Sessione non valida" },
        { status: 401 }
      );
    }

    if (auth.code === "PROFILE_RESOLUTION_ERROR") {
      console.error("Errore risoluzione profilo in userImages:", auth.error);
      return NextResponse.json(
        { code: "PROFILE_RESOLUTION_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { code: "PROFILE_NOT_FOUND", error: "Profilo non trovato" },
      { status: 404 }
    );
  }

  const limit = parseLimit(req.nextUrl.searchParams.get("limit"));

  const { data: listedFiles, error: listError } = await supabase.storage
    .from(USER_IMAGES_BUCKET)
    .list(USER_IMAGES_ROOT_PATH, {
      limit,
      offset: 0,
      sortBy: { column: "name", order: "desc" },
      search: `${auth.profileId}-`,
    });

  if (listError) {
    console.error("Errore listing immagini utente da storage:", listError);
    return NextResponse.json(
      { code: "USER_IMAGES_LIST_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const images: UserImageDto[] = (listedFiles ?? [])
    .filter((file) => isOwnedImageFile(file.name, auth.profileId))
    .map((file) => {
      const path = `${USER_IMAGES_ROOT_PATH}/${file.name}`;
      const { data: publicUrlData } = supabase.storage
        .from(USER_IMAGES_BUCKET)
        .getPublicUrl(path);

      return {
        name: file.name,
        path,
        url: publicUrlData.publicUrl ?? "",
        createdAt: file.created_at ?? null,
        updatedAt: file.updated_at ?? null,
      };
    })
    .filter((file) => file.url.trim().length > 0);

    const response : GetUsersImagePayload = {
    code: "USER_IMAGES_FETCHED",
    profileId: auth.profileId,
    bucket: USER_IMAGES_BUCKET,
    count: images.length,
    images,
  }

  return NextResponse.json(response);
}

export interface GetUsersImagePayload 
    {
    code: string;
    profileId: string;
    bucket: string;
    count: number;
    images:UserImageDto[]
  }