import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { PostInsert, PostRow } from "@/types/db.generated";

export type NewPostPayload = {
  postText: string;
  postImage?: Uint8Array;
};

type NewPostBody = {
  postText?: string;
  postImage?: unknown;
};

function parseBody(body: unknown): { postText: string } | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as NewPostBody;
  if (typeof candidate.postText !== "string") {
    return null;
  }

  const normalizedText = candidate.postText.trim();
  if (normalizedText.length === 0) {
    return null;
  }

  return { postText: normalizedText };
}

export async function POST(postReq: NextRequest) {
  let requestBody: unknown;
  try {
    requestBody = await postReq.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_BODY", error: "Body JSON non valido" },
      { status: 400 }
    );
  }

  const body = parseBody(requestBody);
  if (!body) {
    return NextResponse.json(
      { code: "INVALID_POST_INPUT", error: "postText non valido" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const auth = await resolveAuthenticatedProfileIdFromRequest(postReq, supabase);

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
      console.error("Errore risoluzione profilo in creazione post:", auth.error);
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

  const newPost: PostInsert = {
    authorId: auth.profileId,
    content: body.postText,
    postType: "post",
  };

  const { data: createdPost, error: createPostError } = await supabase
    .from("post")
    .insert(newPost)
    .select("id, authorId, content, mediaUrl, postType, createdAt")
    .single<PostRow>();

  if (createPostError || !createdPost) {
    console.error("Errore durante inserimento post:", createPostError);
    return NextResponse.json(
      { code: "CREATE_POST_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      code: "POST_CREATED",
      post: {
        id: createdPost.id,
        authorId: createdPost.authorId,
        content: createdPost.content ?? "",
        mediaUrl: createdPost.mediaUrl,
        postType: createdPost.postType,
        createdAt: createdPost.createdAt,
      },
    },
    { status: 201 }
  );
}
