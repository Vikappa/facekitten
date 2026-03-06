import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/serverAdminClient";
import { extractSessionIdentity, verifySession } from "./SessionSecurity";

type SessionProfileStatus = {
  isAuthenticated: boolean;
  profileId?: string;
  isConfirmed?: boolean;
};

export async function getSessionProfileStatus(sessionToken: string): Promise<SessionProfileStatus> {
  let payload: Awaited<ReturnType<typeof verifySession>>;

  try {
    payload = await verifySession(sessionToken);
  } catch {
    return { isAuthenticated: false };
  }

  const { profileId, email } = extractSessionIdentity(payload);

  if (!profileId && !email) {
    return { isAuthenticated: true };
  }

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
