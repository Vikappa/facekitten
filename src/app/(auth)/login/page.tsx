'use client'

import { setCurrentProfile, UserProfile } from "@/lib/redux/profileSlice";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";

type LoginSuccessResponse = {
  code: "LOGIN_OK";
  profileId: string;
  preloadData?: PreloadPayload;
};

type PreloadPayload = {
  profilePicture?: string;
  coverPhoto?: string;
  name?: string;
  bio?: string;
}

type LoginErrorResponse = {
  code?: string;
  error?: string;
};

const isLoginSuccessResponse = (payload: unknown): payload is LoginSuccessResponse => {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Partial<LoginSuccessResponse>;
  return candidate.code === "LOGIN_OK" && typeof candidate.profileId === "string";
};

const isLoginErrorResponse = (payload: unknown): payload is LoginErrorResponse => {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Partial<LoginErrorResponse>;
  return (
    candidate.code === undefined || typeof candidate.code === "string"
  ) && (
    candidate.error === undefined || typeof candidate.error === "string"
  );
};

const toAbsoluteAssetUrl = (url: string) => {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return new URL(url, window.location.origin).toString();
};

const downloadAssetContent = async (url?: string): Promise<Uint8Array | []> => {
  if (!url) {
    return [];
  }

  try {
    const absoluteUrl = toAbsoluteAssetUrl(url);
    const response = await fetch(absoluteUrl);

    if (!response.ok) {
      return [];
    }

    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch {
    return [];
  }
};



export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/login/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.ok) {
        if (!isLoginSuccessResponse(payload)) {
          setError("Risposta login non valida.");
          return;
        }

        const successPayload = payload;
        const avatarUrl = successPayload.preloadData?.profilePicture
          ? toAbsoluteAssetUrl(successPayload.preloadData.profilePicture)
          : "";
        const bannerUrl = successPayload.preloadData?.coverPhoto
          ? toAbsoluteAssetUrl(successPayload.preloadData.coverPhoto)
          : "";


        const downloadedProfileData : UserProfile = {
          id: successPayload.profileId,
          email: email,
          username: successPayload.preloadData?.name ?? "",
          avatarUrl,
          bannerUrl,
          bio: successPayload.preloadData?.bio ?? "",
          confirmedAccount: true
        }

        dispatch(setCurrentProfile(downloadedProfileData))

        router.replace("/");
        router.refresh();
        return;
      }

      const errorPayload = isLoginErrorResponse(payload) ? payload : {};

      if (response.status === 403 && errorPayload.code === "ACCOUNT_NOT_VERIFIED") {
        router.push("/profile/verify");
        return;
      }

      if (response.status === 401) {
        setError("Email o password non validi.");
        return;
      }

      setError(
        typeof errorPayload.error === "string"
          ? errorPayload.error
          : "Si è verificato un errore durante il login. Riprova più tardi."
      );
    } catch {
      setError("Si è verificato un errore durante il login. Riprova più tardi.");
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
        <div className={`flex w-full flex-col gap-1 border border-gray-300 rounded-lg ${isEmailFocused ? `border-2 border-gray-500` : ``}`}>
          <label htmlFor="email" className={isEmailFocused ? `text-sm font-medium text-gray-700 pt-2 ps-2` : `text-transparent`}>
            Email
          </label>
          <input
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            className={`rounded-full border-0 px-6 py-4 pt-0 bg-transparent focus:outline-none focus:ring-transparent focus:border-transparent
              ${isEmailFocused ? ``
                :
                ``
              }`
            }
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
            className={`rounded-full border-0 px-6 py-4 pt-0 bg-transparent focus:outline-none focus:ring-transparent focus:border-transparent
              ${isPasswordFocused ? ``
                :
                ``
              }`

            }
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
          {isSubmitting ? "Accesso..." : "Accedi"}
        </button>
      </form>
      {error && <p onClick={() => {location.reload}} className="text-sm text-red-600">{error}</p>}
      <div className="text-sm text-gray-700 w-full text-center">
        <Link className="text-blue-700 no-underline py-4 flex items-center justify-center border-primary border rounded-full" href="/registration">
          Crea un nuovo account
        </Link>
      </div>
    </div>
  );
}
