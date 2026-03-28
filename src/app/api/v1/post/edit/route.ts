import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { PostRow } from "@/types/db.generated";

export type EditPostPayload = {
  postId: string;
  postText: string;
};

type EditPostBody = {
  postId?: string;
  postText?: string;
};

type PostIdentityRow = {
  id: string;
  authorId: string;
};

function parseBody(body: unknown): EditPostPayload | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as EditPostBody;
  if (typeof candidate.postId !== "string" || typeof candidate.postText !== "string") {
    return null;
  }

  const normalizedPostId = candidate.postId.trim();
  const normalizedPostText = candidate.postText.trim();

  if (normalizedPostId.length === 0 || normalizedPostText.length === 0) {
    return null;
  }

  return {
    postId: normalizedPostId,
    postText: normalizedPostText,
  };
}

export async function PUT(req: NextRequest) {
  let requestBody: unknown;
  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_BODY", error: "Body JSON non valido" },
      { status: 400 }
    );
  }

  const body = parseBody(requestBody);
  if (!body) {
    return NextResponse.json(
      { code: "INVALID_POST_EDIT_INPUT", error: "postId o postText non validi" },
      { status: 400 }
    );
  }

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
      console.error("Errore risoluzione profilo in modifica post:", auth.error);
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

  const { data: postIdentity, error: postIdentityError } = await supabase
    .from("post")
    .select("id, authorId")
    .eq("id", body.postId)
    .limit(1)
    .maybeSingle<PostIdentityRow>();

  if (postIdentityError) {
    console.error("Errore recupero post in modifica:", postIdentityError);
    return NextResponse.json(
      { code: "POST_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  if (!postIdentity) {
    return NextResponse.json(
      { code: "POST_NOT_FOUND", error: "Post non trovato" },
      { status: 404 }
    );
  }

  if (postIdentity.authorId !== auth.profileId) {
    return NextResponse.json(
      { code: "POST_FORBIDDEN", error: "Non puoi modificare questo post" },
      { status: 403 }
    );
  }

  const { data: updatedPost, error: updatePostError } = await supabase
    .from("post")
    .update({ content: body.postText })
    .eq("id", body.postId)
    .eq("authorId", auth.profileId)
    .select("id, authorId, content, mediaUrl, postType, created_at")
    .single<PostRow>();

  if (updatePostError || !updatedPost) {
    console.error("Errore update post:", updatePostError);
    return NextResponse.json(
      { code: "UPDATE_POST_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    code: "POST_UPDATED",
    post: {
      id: updatedPost.id,
      authorId: updatedPost.authorId,
      content: updatedPost.content ?? "",
      mediaUrl: updatedPost.mediaUrl,
      postType: updatedPost.postType,
      createdAt: updatedPost.created_at,
    },
  });
}
