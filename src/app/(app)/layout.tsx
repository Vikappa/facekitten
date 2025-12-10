"use client";

import type { ReactNode } from "react";
import { NavBar } from "../components/organisms/Navbar/Navbar";
import { ShareModalProvider } from "../components/organisms/ShareModal";
import { Engine } from "./home/ActionsEngine";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <ShareModalProvider >
                <Engine>
                    <NavBar />
                    <main className="flex-1 bg-gray-100">
                        {children}
                    </main>
                </Engine>
            </ShareModalProvider >

        </div>
    );
}
