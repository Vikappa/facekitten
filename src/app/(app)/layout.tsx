import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CommonLayout from "../components/organisms/CommonLayout";
import { getSessionProfileStatus } from "@/lib/Security/SessionProfileStatus";


export default async function AppLayout({ children }: { children: ReactNode }) {
    const sessionToken = (await cookies()).get("fk_session")?.value;

    if (!sessionToken) {
        redirect("/login?next=/");
    }

    const sessionStatus = await getSessionProfileStatus(sessionToken);

    if (!sessionStatus.isAuthenticated) {
        redirect("/login?next=/");
    }

    if (sessionStatus.isConfirmed === false) {
        redirect("/profileregistration/verify");
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
