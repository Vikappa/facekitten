'use client'

import { useState } from "react"

export default function VerifyPage() {


    const [codice, setCodice ] = useState("")

    const verifyCode = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch("/api/profileregistration/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ code: codice })
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-4xl font-bold mb-4">Verifica il tuo account</h1>
            <p className="text-lg text-gray-600 mb-8">Controlla la tua email per il codice di verifica e inseriscilo qui sotto.</p>
            <form onSubmit={verifyCode}>
                <input
                    type="text"
                    placeholder="Inserisci il codice di verifica"
                    className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full max-w-sm"
                    value={codice}
                    onChange={(e) => setCodice(e.target.value)}
                />
                <input className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors" type="submit" value="Verifica" />
            </form>
        </div>
    )
}
