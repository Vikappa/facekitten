import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionProfileStatus } from "@/lib/Security/SessionProfileStatus";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const sessionTokens = (await cookies())
    .getAll("fk_session")
    .map(({ value }) => value.trim())
    .filter((value) => value.length > 0);

  for (const sessionToken of sessionTokens) {
    const sessionStatus = await getSessionProfileStatus(sessionToken);

    if (sessionStatus.isAuthenticated && sessionStatus.isConfirmed === true) {
      redirect("/");
    }
  }

  return <>{children}</>;
}
