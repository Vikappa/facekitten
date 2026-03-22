import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionProfileStatus } from "@/lib/Security/SessionProfileStatus";
import {
  IDENTITY_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/Security/SessionSecurity";
import { resolveIdentityCookieFromToken } from "@/lib/Security/SessionRequestProfileResolver";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionTokens = cookieStore
    .getAll(SESSION_COOKIE_NAME)
    .map(({ value }) => value.trim())
    .filter((value) => value.length > 0);

  for (const sessionToken of sessionTokens) {
    const sessionStatus = await getSessionProfileStatus(sessionToken);

    if (sessionStatus.isAuthenticated && sessionStatus.isConfirmed === true) {
      redirect("/");
    }
  }

  const identityTokens = cookieStore
    .getAll(IDENTITY_COOKIE_NAME)
    .map(({ value }) => value.trim())
    .filter((value) => value.length > 0);

  for (const identityToken of identityTokens) {
    const identityStatus = await resolveIdentityCookieFromToken(identityToken);
    if (identityStatus.ok) {
      redirect("/login/reissue");
    }
  }

  return <>{children}</>;
}
