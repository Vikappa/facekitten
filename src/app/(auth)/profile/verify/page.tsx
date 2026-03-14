'use client'

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type VerifyErrorResponse = {
  error?: string;
};

const isVerifyErrorResponse = (payload: unknown): payload is VerifyErrorResponse => {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Partial<VerifyErrorResponse>;
  return candidate.error === undefined || typeof candidate.error === "string";
};

export default function VerifyPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeFocused, setIsCodeFocused] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      setError("Inserisci il codice di verifica.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/profileregistration/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: normalizedCode }),
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const message =
          isVerifyErrorResponse(payload) && typeof payload.error === "string"
            ? payload.error
            : "Codice non valido. Riprova.";
        setError(message);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Errore durante la verifica. Riprova tra qualche secondo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-evenly gap-4 px-6">
      <div>
        <Image src="/img/facekittenlogo.png" alt="FaceKitten Logo" width={100} height={100} />
      </div>
      <div className="w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900">Verifica il tuo account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Ti abbiamo inviato un codice via email. Inseriscilo qui sotto per attivare il profilo.
        </p>
      </div>
      <form className="flex w-full flex-col gap-3" onSubmit={onSubmit}>
        <div className={`flex w-full flex-col gap-1 rounded-lg border border-gray-300 ${isCodeFocused ? "border-2 border-gray-500" : ""}`}>
          <label htmlFor="verification-code" className={isCodeFocused ? "pt-2 ps-2 text-sm font-medium text-gray-700" : "text-transparent"}>
            Codice di verifica
          </label>
          <input
            id="verification-code"
            name="verification-code"
            autoComplete="one-time-code"
            onFocus={() => setIsCodeFocused(true)}
            onBlur={() => setIsCodeFocused(false)}
            className="rounded-full border-0 bg-transparent px-6 py-4 pt-0 uppercase focus:border-transparent focus:outline-none focus:ring-transparent"
            type="text"
            inputMode="text"
            placeholder={isCodeFocused ? "" : "Codice di verifica"}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
            maxLength={32}
            disabled={isSubmitting}
          />
        </div>
        <button
          className="rounded-full bg-blue-600 px-6 py-4 text-white disabled:opacity-60"
          type="submit"
          disabled={isSubmitting || code.trim().length === 0}
        >
          {isSubmitting ? "Verifica..." : "Verifica account"}
        </button>
      </form>
      {error && <p className="w-full text-center text-sm text-red-600">{error}</p>}
      <div className="w-full text-center text-sm text-gray-700">
        <Link className="flex items-center justify-center rounded-full border border-primary py-4 text-blue-700 no-underline" href="/login">
          Torna al login
        </Link>
      </div>
    </div>
  );
}
