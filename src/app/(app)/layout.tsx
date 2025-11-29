"use client";

import type { ReactNode } from "react";
import { NavBar } from "../components/organisms/Navbar/Navbar";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-1 bg-gray-100">
                {children}
            </main>

        </div>
    );
}
