import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/Security/SessionSecurity";
import { resolveAuthenticatedProfileIdFromRequest } from "@/lib/Security/SessionRequestProfileResolver";
import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import type { FriendshipsRow } from "@/types/db.generated";

type FriendshipPair = Pick<FriendshipsRow, "user_a" | "user_b">;

function parseSkip(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export async function GET(req: NextRequest) {
  const skip = parseSkip(req.nextUrl.searchParams.get("skip"));
  if (skip === null) {
    return NextResponse.json(
      {
        code: "INVALID_SKIP",
        error: "Parametro skip non valido (intero >= 0 richiesto)",
      },
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
      console.error("Errore risoluzione profilo in homepage feed paginata:", auth.error);
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

  const { data: friendships, error: friendshipsError } = await supabase
    .from("friendships")
    .select("user_a, user_b")
    .or(`user_a.eq.${auth.profileId},user_b.eq.${auth.profileId}`);

  if (friendshipsError) {
    console.error("Errore recupero amicizie homepage paginata:", friendshipsError);
    return NextResponse.json(
      { code: "FRIENDSHIPS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  const authorIds = new Set<string>([auth.profileId]);

  for (const friendship of (friendships ?? []) as FriendshipPair[]) {
    if (friendship.user_a === auth.profileId) {
      authorIds.add(friendship.user_b);
      continue;
    }

    if (friendship.user_b === auth.profileId) {
      authorIds.add(friendship.user_a);
    }
  }

  const authorIdsList = Array.from(authorIds);

  const { data: posts, error: postsError } = await supabase
    .from("post")
    .select("id, authorId, content, mediaUrl, postType, createdAt")
    .in("authorId", authorIdsList)
    .order("createdAt", { ascending: false })
    .range(skip, skip + 9);

  if (postsError) {
    console.error("Errore recupero post homepage paginata:", postsError);
    return NextResponse.json(
      { code: "POSTS_FETCH_ERROR", error: "Errore interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    code: "HOMEPAGE_POSTS_PAGE_OK",
    skip,
    posts: (posts ?? []).map((post) => ({
      id: post.id,
      authorId: post.authorId,
      content: post.content ?? "",
      mediaUrl: post.mediaUrl,
      postType: post.postType,
      createdAt: post.createdAt,
    })),
  });
}
