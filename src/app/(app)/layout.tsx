"use client";

import type { ReactNode } from "react";


export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
                    <main className="flex-1 bg-gray-100">
                        {children}
                    </main>
        </div>
    );
}
