import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import { resolveSessionIdentityFromToken } from "./SessionRequestProfileResolver";

type SessionProfileStatus = {
  isAuthenticated: boolean;
  profileId?: string;
  isConfirmed?: boolean;
};

export async function getSessionProfileStatus(sessionToken: string): Promise<SessionProfileStatus> {
  const sessionResult = await resolveSessionIdentityFromToken(sessionToken);

  if (!sessionResult.ok) {
    if (sessionResult.code === "INVALID_SESSION") {
      return { isAuthenticated: false };
    }

    return { isAuthenticated: true };
  }

  const { profileId, email } = sessionResult.identity;
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("Profile").select("id, confirmedAccount").limit(1);

  if (profileId) {
    query = query.eq("id", profileId);
  } else if (email) {
    query = query.eq("email", email);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return { isAuthenticated: true, profileId };
  }

  return {
    isAuthenticated: true,
    profileId: data.id,
    isConfirmed: data.confirmedAccount === true,
  };
}
