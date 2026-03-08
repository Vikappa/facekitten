import {
  SESSION_COOKIE_NAME,
  extractSessionIdentity,
  verifySession,
} from "@/lib/Security/SessionSecurity";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

type ProfileIdentityRow = {
  id: string;
};

type UpdatedProfilePictureRow = {
  id: string;
  avatarUrl: string | null;
};

type ImageResizeResult =
  | { status: "ok"; buffer: Buffer }
  | { status: "invalid_image" }
  | { status: "size_limit_exceeded" };

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_RESIZED_BYTES = 1 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 800;
const MAX_IMAGE_HEIGHT = 600;
const PROFILE_PICTURE_BUCKET = "FacekittenProfilePictures";
const WEBP_QUALITY_STEPS = [80, 72, 64, 56, 48, 40];

async function hasValidImageContent(imageBuffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return !!metadata.format;
  } catch {
    return false;
  }
}

async function resizeProfilePictureToWebp(imageBuffer: Buffer): Promise<ImageResizeResult> {
  for (const quality of WEBP_QUALITY_STEPS) {
    try {
      const transformedBuffer = await sharp(imageBuffer)
        .rotate()
        .resize({
          width: MAX_IMAGE_WIDTH,
          height: MAX_IMAGE_HEIGHT,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer();

      if (transformedBuffer.byteLength <= MAX_RESIZED_BYTES) {
        return { status: "ok", buffer: transformedBuffer };
      }
    } catch {
      return { status: "invalid_image" };
    }
  }

  return { status: "size_limit_exceeded" };
}

export async function POST(req: NextRequest) {
  // 1) Controllo sessione: la route è protetta, quindi richiede il cookie di sessione.
  const sessionTokens = req.cookies
    .getAll(SESSION_COOKIE_NAME)
    .map(({ value }) => value.trim())
    .filter((value) => value.length > 0);

  if (sessionTokens.length === 0) {
    return NextResponse.json(
      { code: "SESSION_REQUIRED", error: "Sessione mancante" },
      { status: 401 }
    );
  }

  let payload: Awaited<ReturnType<typeof verifySession>> | null = null;

  // 2) Verifica crittografica della sessione.
  for (const sessionToken of sessionTokens) {
    try {
      payload = await verifySession(sessionToken);
      break;
    } catch {
      // Prova il prossimo token in caso di cookie duplicati.
    }
  }

  if (!payload) {
    const response = NextResponse.json(
      { code: "INVALID_SESSION", error: "Sessione non valida" },
      { status: 401 }
    );
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // 3) Estrazione identità minima (profileId o email) dal token validato.
  const { profileId: tokenProfileId, email } = extractSessionIdentity(payload);
  if (!tokenProfileId && !email) {
    return NextResponse.json(
      { code: "INVALID_SESSION_IDENTITY", error: "Sessione non valida" },
      { status: 401 }
    );
  }

  // 4) Risoluzione del profilo associato alla sessione.
  const supabase = createSupabaseAdminClient();
  let profileQuery = supabase.from("Profile").select("id").limit(1);

  if (tokenProfileId) {
    profileQuery = profileQuery.eq("id", tokenProfileId);
  } else if (email) {
    profileQuery = profileQuery.eq("email", email);
  }

  const { data: profileIdentity, error: profileIdentityError } = await profileQuery.maybeSingle<ProfileIdentityRow>();

  if (profileIdentityError) {
    console.error(
      "Errore durante la risoluzione del profilo da sessione:",
      profileIdentityError
    );
    return NextResponse.json(
      { code: "PROFILE_RESOLUTION_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!profileIdentity) {
    return NextResponse.json(
      { code: "PROFILE_NOT_FOUND", error: "Profilo non trovato" },
      { status: 404 }
    );
  }

  try {
    // 5) Parsing multipart/form-data e recupero del campo file `newImage`.
    const formData = await req.formData();
    const imageEntry = formData.get("newImage");

    if (!(imageEntry instanceof File)) {
      return NextResponse.json({ error: "Nessuna immagine fornita" }, { status: 400 });
    }

    const image = imageEntry;

    // 6) Primo filtro: MIME type dichiarato dal client.
    if (!image.type || !image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Formato file non valido" }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());

    // 7) Limite hard sul file in ingresso per evitare payload troppo grandi.
    if (imageBuffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Immagine troppo grande (max 5MB)" }, { status: 413 });
    }

    // 8) Secondo filtro: validazione del contenuto reale (anti-spoof MIME).
    const validImageContent = await hasValidImageContent(imageBuffer);
    if (!validImageContent) {
      return NextResponse.json(
        { error: "Il file caricato non è un'immagine valida" },
        { status: 400 }
      );
    }

    // 9) Resize + compressione: max 800x600 e max 1MB in output.
    const resizeResult = await resizeProfilePictureToWebp(imageBuffer);
    if (resizeResult.status === "invalid_image") {
      return NextResponse.json(
        { error: "Il file caricato non è un'immagine valida" },
        { status: 400 }
      );
    }

    if (resizeResult.status === "size_limit_exceeded") {
      return NextResponse.json(
        { error: "Impossibile ridurre l'immagine entro 1MB e 800x600" },
        { status: 413 }
      );
    }

    const resizedImageBuffer = resizeResult.buffer;
    const filePath = `public/${profileIdentity.id}-${Date.now()}.webp`;

    // 10) Upload su Supabase Storage (bucket profilo) del file già normalizzato.
    const { data: uploadResult, error: uploadError } = await supabase.storage
      .from(PROFILE_PICTURE_BUCKET)
      .upload(filePath, resizedImageBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError || !uploadResult) {
      console.error("Errore durante upload su storage:", uploadError);
      return NextResponse.json(
        { code: "UPLOAD_PROFILE_PICTURE_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    // 11) Recupero URL pubblico dal path appena caricato.
    const { data: publicUrlData } = supabase.storage
      .from(PROFILE_PICTURE_BUCKET)
      .getPublicUrl(uploadResult.path);

    const avatarUrl = publicUrlData.publicUrl;
    if (!avatarUrl) {
      return NextResponse.json(
        { code: "PROFILE_PICTURE_URL_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    // 12) Persistenza URL nel profilo applicativo.
    const { data: updatedProfile, error: updateError } = await supabase
      .from("Profile")
      .update({ avatarUrl })
      .eq("id", profileIdentity.id)
      .select("id, avatarUrl")
      .single<UpdatedProfilePictureRow>();

    if (updateError || !updatedProfile) {
      console.error("Errore durante update foto profilo:", updateError);
      return NextResponse.json(
        { code: "UPDATE_PROFILE_PICTURE_ERROR", error: "Errore interno" },
        { status: 500 }
      );
    }

    // 13) Risposta finale con URL salvato.
    return NextResponse.json({
      code: "PROFILE_PICTURE_UPDATED",
      profileId: updatedProfile.id,
      avatarUrl: updatedProfile.avatarUrl ?? "",
    });
  } catch {
    return NextResponse.json(
      { error: "ERRORE INTERNO NELL'UPLOAD DEL FILE" },
      { status: 500 }
    );
  }
}
