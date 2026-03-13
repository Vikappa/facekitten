import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CommonLayout from "../components/organisms/CommonLayout";
import { getSessionProfileStatus } from "@/lib/Security/SessionProfileStatus";


export default async function AppLayout({ children }: { children: ReactNode }) {
    const sessionTokens = (await cookies())
        .getAll("fk_session")
        .map(({ value }) => value.trim())
        .filter((value) => value.length > 0);

    if (sessionTokens.length === 0) {
        redirect("/login?next=/");
    }

    let sessionStatus: Awaited<ReturnType<typeof getSessionProfileStatus>> = {
        isAuthenticated: false,
    };

    for (const sessionToken of sessionTokens) {
        const candidateStatus = await getSessionProfileStatus(sessionToken);
        if (candidateStatus.isAuthenticated) {
            sessionStatus = candidateStatus;
            break;
        }
    }

    if (!sessionStatus.isAuthenticated) {
        redirect("/login?next=/");
    }

    if (sessionStatus.isConfirmed === false) {
        redirect("/profile/verify");
    }

    return (
        <CommonLayout>
            <div className="min-h-screen flex flex-col">
                <main className="flex-1 bg-gray-100">
                    {children}
                </main>
            </div>
        </CommonLayout>
    );
}
