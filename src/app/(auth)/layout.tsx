import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionProfileStatus } from "@/lib/Security/SessionProfileStatus";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const sessionToken = (await cookies()).get("fk_session")?.value;

  if (sessionToken) {
    const sessionStatus = await getSessionProfileStatus(sessionToken);

    if (sessionStatus.isAuthenticated && sessionStatus.isConfirmed === true) {
      redirect("/");
    }
  }

  return <>{children}</>;
}
