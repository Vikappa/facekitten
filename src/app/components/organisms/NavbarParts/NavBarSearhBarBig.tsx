'use client'
import { useState } from "react";

export default function NavBarSearhBarBig(){

    const [searchTerm, setSearchTerm] = useState("");

    return (
            <div className="relative">
                <input
                    type="text"
                    placeholder="Cerca micetti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border bg-tertiary border-tertiary rounded-full focus:outline-none focus:ring-0 focus:ring-light-blue-500 ps-9"
                />
                <span className="absolute left-2 top-2 text-gray-500">
                    🔍
                </span>
            </div>
    )
}