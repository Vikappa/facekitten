'use client'

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegistrationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profileregistration/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          typeof payload?.error === "string"
            ? payload.error
            : "Registrazione fallita";
        throw new Error(message);
      }

      router.push("/login?registered=1");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore durante la registrazione";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-evenly gap-4 px-6">
      <div className="">
        <Image src="/img/facekittenlogo.png" alt="FaceKitten Logo" width={100} height={100} />
      </div>
      <form className="flex w-full flex-col gap-3" onSubmit={onSubmit}>
        <div className={`flex w-full flex-col gap-1 border border-gray-300 rounded-lg ${isNameFocused ? `border-2 border-gray-500` : ``}`}>
          <label htmlFor="name" className={isNameFocused ? `text-sm font-medium text-gray-700 pt-2 ps-2` : `text-transparent`}>
            Nome
          </label>
          <input
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            className="rounded-full border-0 px-6 py-4 pt-0 bg-transparent focus:outline-none focus:ring-transparent focus:border-transparent"
            type="text"
            id="name"
            placeholder={isNameFocused ? "" : "Nome"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={`flex w-full flex-col gap-1 border border-gray-300 rounded-lg ${isEmailFocused ? `border-2 border-gray-500` : ``}`}>
          <label htmlFor="email" className={isEmailFocused ? `text-sm font-medium text-gray-700 pt-2 ps-2` : `text-transparent`}>
            Email
          </label>
          <input
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            className="rounded-full border-0 px-6 py-4 pt-0 bg-transparent focus:outline-none focus:ring-transparent focus:border-transparent"
            type="email"
            id="email"
            placeholder={isEmailFocused ? "" : "Email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={`flex w-full flex-col gap-1 border border-gray-300 rounded-lg ${isPasswordFocused ? `border-2 border-gray-500` : ``}`}>
          <label htmlFor="password" className={isPasswordFocused ? `text-sm font-medium text-gray-700 pt-2 ps-2` : `text-transparent`}>
            Password
          </label>
          <input
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            className="rounded-full border-0 px-6 py-4 pt-0 bg-transparent focus:outline-none focus:ring-transparent focus:border-transparent"
            type="password"
            id="password"
            placeholder={isPasswordFocused ? "" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="rounded-full bg-blue-600 px-6 py-4 text-white disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Invio..." : "Registrati"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="text-sm text-gray-700 w-full text-center">
        <Link className="text-blue-700 no-underline py-4 flex items-center justify-center border-primary border rounded-full" href="/login">
          Ho già un account
        </Link>
      </div>
    </div>
  );
}
