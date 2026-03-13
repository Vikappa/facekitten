'use client'

import { useAppDispatch } from "@/lib/redux/hooks";
import { patchCurrentProfile } from "@/lib/redux/profileSlice";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaCamera } from "react-icons/fa";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import type { Lettino } from "@/types/db.generated";
import type { ILocationOptions } from "@/lib/interfaces/LocationOptions";
import { LocationSearchResponse } from "@/lib/interfaces/LocationSearchResponses";

export type ProfileEditPayload = {
    username: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    bio: string | null;
    confirmedAccount: boolean | null;
    dataDiNascita: string | null;
    favToy: string | null;
    location_id: string | null;
    tipoCuccia: Lettino | null;
};

type ProfileEditSuccessResponse = {
    code: "PROFILE_DATA_OK";
    profile: ProfileEditPayload;
};

type ProfileSetDataSuccessResponse = {
    code: "PROFILE_UPDATED";
    profileId: string;
    profile: ProfileEditPayload;
};

type ProfileEditErrorResponse = {
    code?: string;
    error?: string;
};

const LETTINO_OPTIONS = [
    "Cuccia",
    "Scatola",
    "Cassetto dei calzini (scassinato)",
    "Strada",
    "Letto di umano (ospite)",
    "Letto di umano (espropriato)",
    "Divano",
    "Sedia",
    "Poltrona",
] as const satisfies readonly Lettino[];

function getValidImageUrl(url: string | null | undefined, fallbackUrl: string) {
    const normalizedUrl = url?.trim();
    return normalizedUrl ? normalizedUrl : fallbackUrl;
}

function isProfileEditSuccessResponse(payload: unknown): payload is ProfileEditSuccessResponse {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const candidate = payload as Partial<ProfileEditSuccessResponse>;
    if (candidate.code !== "PROFILE_DATA_OK") {
        return false;
    }

    const profile = candidate.profile as Partial<ProfileEditPayload> | undefined;
    return !!profile && typeof profile.username === "string";
}

function isProfileSetDataSuccessResponse(payload: unknown): payload is ProfileSetDataSuccessResponse {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const candidate = payload as Partial<ProfileSetDataSuccessResponse>;
    if (candidate.code !== "PROFILE_UPDATED" || typeof candidate.profileId !== "string") {
        return false;
    }

    const profile = candidate.profile as Partial<ProfileEditPayload> | undefined;
    return !!profile && typeof profile.username === "string";
}

function isLocationOption(payload: unknown): payload is ILocationOptions {
    if (typeof payload !== "object" || payload === null) {
        return false;
    }

    const candidate = payload as Partial<ILocationOptions>;
    return typeof candidate.id === "string" && typeof candidate.descr === "string";
}


export default function ModificaProfilePage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [currentProfile, setCurrentProfile] = useState<ProfileEditPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trueLocationStateObj, setTrueLocationStateObj] = useState<ILocationOptions | undefined>()
    const [locationInputValue, setLocationInputValue] = useState("");
    const [isLocationOptionsOpen, setIsLocationOptionsOpen] = useState(false);
    const [birthDate, setBirthDate] = useState("");
    const [selectedLettino, setSelectedLettino] = useState<Lettino | "">("");
    const [favoriteToy, setFavoriteToy] = useState("");
    const [locationCurrentOptions, setLocationCurrentOptions] = useState<ILocationOptions[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null);
    const selectedAvatarFileRef = useRef<File | null>(null);

    const profileBanner = getValidImageUrl(
        currentProfile?.bannerUrl,
        "/assets/grumpy-cat-background-facebook-cover.jpg"
    );
    const profileAvatar = getValidImageUrl(
        currentProfile?.avatarUrl,
        "/assets/blankprofile.png"
    );

    function handleUploadProfilePicture() {
        fileInputRef.current?.click();
    }


    const handleSelectLocation = (location: ILocationOptions) => {
        setTrueLocationStateObj(location);
        setLocationInputValue(location.descr);
        setIsLocationOptionsOpen(false);
    };

    const updateLocationOptions = async (queryText: string) => {
        const normalizedQuery = queryText.trim();
        if (!normalizedQuery) {
            setLocationCurrentOptions([]);
            return;
        }

        try {
            const response = await fetch(
                `/api/v1/get/locationsearch?q=${encodeURIComponent(normalizedQuery)}`,
                {
                    method: "GET",
                    cache: "no-store",
                }
            );

            const payload = await response.json().catch(() => null) as LocationSearchResponse | null;
            console.log("[updateLocationOption] Location search response:", {
                status: response.status,
                ok: response.ok,
                payload,
            });

            if (!response.ok || !payload?.features) {
                setLocationCurrentOptions([]);
                return;
            }

            const locOptions = payload.features.map((feature) => ({
                id: feature.properties.place_id,
                descr: `${feature.properties.address_line1} ${feature.properties.address_line2}`.trim(),
            }));

            setLocationCurrentOptions(locOptions)
        } catch (error) {
            console.error("[updateLocationOption] Fetch error:", error);
            setLocationCurrentOptions([]);
        }
    };

    async function handleChangeProfilePictureInput(e: ChangeEvent<HTMLInputElement>) {
        setIsLoading(true)
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        selectedAvatarFileRef.current = selectedFile;

        const formData = new FormData();
        formData.append("newImage", selectedAvatarFileRef.current);

        try {
            const response = await fetch("/profile/update/updateProfilePicture", {
                method: "POST",
                body: formData,
            });

            const payload = await response.json() as { avatarUrl?: string; error?: string };

            if (!response.ok) {
                console.error(payload.error ?? "Errore upload immagine profilo");
                return;
            }

            if (payload.avatarUrl) {
                dispatch(patchCurrentProfile({ avatarUrl: payload.avatarUrl }));
            }
        } catch (error) {
            console.error("Errore rete durante upload immagine profilo", error);
        } finally {
            e.target.value = "";
            setIsLoading(false)

        }
    }

    useEffect(() => {
        const controller = new AbortController();

        const loadProfileData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch("/profile/modifica/getdata", {
                    method: "GET",
                    signal: controller.signal,
                    cache: "no-store",
                });

                let payload: unknown = null;
                try {
                    payload = await response.json();
                } catch {
                    payload = null;
                }

                if (!response.ok) {
                    const errorPayload = (payload as ProfileEditErrorResponse | null) ?? null;
                    setError(errorPayload?.error ?? "Errore nel recupero del profilo");
                    return;
                }

                if (!isProfileEditSuccessResponse(payload)) {
                    setError("Risposta profilo non valida");
                    return;
                }

                setCurrentProfile(payload.profile);
                setBirthDate(payload.profile.dataDiNascita ?? "");
                setFavoriteToy(payload.profile.favToy ?? "");
                setSelectedLettino(payload.profile.tipoCuccia ?? "");
                if (payload.profile.location_id && payload.profile.location_id !== "") {
                    const locationDesc: ILocationOptions | undefined = await getLocDescById(payload.profile.location_id);

                    if (locationDesc) {
                        setTrueLocationStateObj({
                            id: locationDesc.id,
                            descr: locationDesc.descr,
                        });
                        setLocationInputValue(locationDesc.descr);
                    } else {
                        // Fallback for legacy/plain-text values or temporary Geoapify issues.
                        setTrueLocationStateObj({
                            id: payload.profile.location_id,
                            descr: payload.profile.location_id,
                        });
                        setLocationInputValue(payload.profile.location_id);
                    }
                } else {
                    setTrueLocationStateObj(undefined);
                    setLocationInputValue("");
                }
            } catch (e) {
                if (e instanceof DOMException && e.name === "AbortError") {
                    return;
                }

                setError("Errore di rete durante il recupero del profilo");
            } finally {
                setIsLoading(false);
            }
        };

        void loadProfileData();

        return () => {
            controller.abort();
        };
    }, []);

    const handleSaveProfile = async () => {
        if (!currentProfile) {
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch("/profile/modifica/setdata", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: currentProfile.username,
                    bio: currentProfile.bio,
                    location_id: trueLocationStateObj?.id ?? currentProfile.location_id ?? null,
                    favToy: favoriteToy,
                    dataDiNascita: birthDate,
                    tipoCuccia: selectedLettino || null,
                }),
            });

            let payload: unknown = null;
            try {
                payload = await response.json();
            } catch {
                payload = null;
            }

            if (!response.ok) {
                const errorPayload = (payload as ProfileEditErrorResponse | null) ?? null;
                setError(errorPayload?.error ?? "Errore nel salvataggio del profilo");
                return;
            }

            if (!isProfileSetDataSuccessResponse(payload)) {
                setError("Risposta salvataggio non valida");
                return;
            }

            setCurrentProfile(payload.profile);
            setBirthDate(payload.profile.dataDiNascita ?? "");
            setFavoriteToy(payload.profile.favToy ?? "");
            setSelectedLettino(payload.profile.tipoCuccia ?? "");
            if (payload.profile.location_id) {
                setTrueLocationStateObj({
                    id: payload.profile.location_id,
                    descr: payload.profile.location_id,
                });
                setLocationInputValue(payload.profile.location_id);
            } else {
                setTrueLocationStateObj(undefined);
                setLocationInputValue("");
            }
            dispatch(
                patchCurrentProfile({
                    username: payload.profile.username,
                    bio: payload.profile.bio ?? "",
                    ...(payload.profile.avatarUrl !== null
                        ? { avatarUrl: payload.profile.avatarUrl }
                        : {}),
                    ...(payload.profile.bannerUrl !== null
                        ? { bannerUrl: payload.profile.bannerUrl }
                        : {}),
                    ...(typeof payload.profile.confirmedAccount === "boolean"
                        ? { confirmedAccount: payload.profile.confirmedAccount }
                        : {}),
                })
            );
            router.replace("/profile");
        } catch {
            setError("Errore di rete durante il salvataggio");
        } finally {
            setIsSaving(false);
        }
    };

    const manageOnblur = () => {
        window.setTimeout(() => setIsLocationOptionsOpen(false), 120);
        if (trueLocationStateObj) {
            setLocationInputValue(trueLocationStateObj.descr);
        }
    };

    const getLocDescById = async (id: string) => {
        try {
            const response = await fetch(
                `/api/v1/get/location?q=${encodeURIComponent(id)}`,
                {
                    method: "GET",
                    cache: "no-store",
                }
            )

            const payload = await response.json().catch(() => null) as unknown;

            if (!response.ok || !isLocationOption(payload)) {
                return undefined;
            }

            return payload;

        } catch {
            console.error("Non sono riuscito a scarica le info della location ", id)
        }
    }

    return (
        <div className="bg-white" >
            <div className="relative h-2/5">
                <div className="h-full overflow-hidden">
                    <Image
                        src={profileBanner}
                        alt="Profile banner"
                        width={1600}
                        height={900}
                        className="w-full h-auto"
                    />
                </div>
                <div className="absolute bottom-0 right-0 z-20 rounded-full bg-secondary ring-2 ring-white p-2.5 -translate-y-1/2 hover:cursor-pointer me-2" onClick={handleUploadProfilePicture}>
                    <FaCamera className="" />
                </div>
            </div>
            <div className="relative ms-3 -top-10 h-24 w-24 shrink-0 -mb-5">
                <div className="relative h-full w-full overflow-hidden rounded-full ring-4 ring-white">
                    {
                        !isLoading && currentProfile ?
                            <Image
                                src={profileAvatar}
                                alt={currentProfile?.username}
                                fill
                                sizes="96px"
                                className="object-cover"
                            /> :
                            <div className="flex h-full w-full items-center justify-center bg-tertiary">
                                <span className="loaderProfilePictures"></span>
                            </div>
                    }
                    <input ref={fileInputRef} className="hidden" />
                </div>

                <div
                    className="absolute -bottom-1 -right-1 z-20 rounded-full bg-secondary p-2.5 hover:cursor-pointer"
                    onClick={handleUploadProfilePicture}
                >
                    <FaCamera className="" />
                    <input ref={fileInputRef} onChange={handleChangeProfilePictureInput} type="file" accept="image/*" className="hidden" />
                </div>
            </div>
            <div className="flex flex-col p-5 pt-0 gap-5">
                <span className="font-bold text-2xl">{isLoading ? "Caricamento profilo..." : error ?? (currentProfile?.username ?? "")}</span>
                <div className="flex flex-col" >
                    <label className="font-medium" htmlFor="bioTextArea">Bio</label>
                    <textarea
                        id="bioTextArea"
                        className="bg-tertiary m-2 rounded-xl focus:ring-0 focus:outline-0 p-5"
                        value={currentProfile?.bio ?? ""}

                        onChange={(e) => {
                            const nextBio = e.target.value;
                            setCurrentProfile((prev) => {
                                if (!prev) {
                                    return prev;
                                }

                                return {
                                    ...prev,
                                    bio: nextBio,
                                };
                            });
                        }}
                    />
                </div>
                <div className="flex flex-col" >
                    <label className="font-medium" htmlFor="dataDiNascita" >Data di nascita</label>
                    <input
                        id="dataDiNascita"
                        type="date"
                        value={birthDate}
                        placeholder="Data di nascita.."
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="bg-tertiary m-2 rounded-xl focus:ring-0 focus:outline-0 p-3"
                    />
                </div>
                <div className="flex flex-col" >
                    <label className="font-medium" htmlFor="locationSearchInput">Location</label>
                    <input
                        id="locationSearchInput"
                        type="text"
                        value={locationInputValue}
                        onFocus={() => setIsLocationOptionsOpen(true)}
                        onChange={(e) => {
                            const nextValue = e.target.value;
                            setLocationInputValue(nextValue);
                            setTrueLocationStateObj(undefined);
                            setIsLocationOptionsOpen(true);
                            void updateLocationOptions(nextValue);
                        }}
                        onBlur={() => manageOnblur()}
                        className="bg-tertiary m-2 rounded-xl focus:ring-0 focus:outline-0 p-3"
                        placeholder="Cerca una location"
                    />
                    <select
                        id="locationInput"
                        value={trueLocationStateObj?.id ?? ""}
                        onChange={(e) => {
                            const nextId = e.target.value;
                            const nextLocation = locationCurrentOptions.find((location) => location.id === nextId);
                            setTrueLocationStateObj(nextLocation);
                            setLocationInputValue(nextLocation ? nextLocation.descr : "");
                        }}
                        className="hidden"
                        aria-hidden="true"
                        tabIndex={-1}
                    >
                        <option value="">Seleziona una location</option>
                        {locationCurrentOptions.map((location) =>
                            <option key={location.id} value={location.id}>
                                {location.descr}
                            </option>
                        )}
                    </select>
                    {isLocationOptionsOpen && (
                        <div className="mx-2 mt-1 max-h-52 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                            {locationCurrentOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-gray-500">Nessuna location trovata</div>
                            ) : (
                                locationCurrentOptions.map((location) => (
                                    <button
                                        key={location.id + "_"}
                                        type="button"
                                        className="block w-full px-3 py-2 text-left text-sm hover:bg-tertiary"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelectLocation(location)}
                                    >
                                        {location.descr}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <div className="flex flex-col" >
                    <label className="font-medium" htmlFor="lettinoInput">Tipo di lettino</label>
                    <select
                        id="lettinoInput"
                        value={selectedLettino}
                        onChange={(e) => setSelectedLettino(e.target.value as Lettino | "")}
                    >
                        <option value="">Seleziona un lettino</option>
                        {LETTINO_OPTIONS.map((lettino) => (
                            <option key={lettino} value={lettino}>
                                {lettino}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col" >
                    <label className="font-medium" htmlFor="giocattoloPrefe" >Giocattolo prefe</label>
                    <input
                        id="giocattoloPrefe"
                        value={favoriteToy}
                        onChange={(e) => setFavoriteToy(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex justify-content-end p-2 gap-2">
                <button className="ms-auto bg-tertiary w-1/3 rounded-lg py-1 font-semibold text-dark-700">Annulla</button>
                <button
                    className="bg-primary w-1/3 rounded-lg py-1 font-semibold text-white disabled:opacity-60"
                    onClick={handleSaveProfile}
                    disabled={isSaving || isLoading || !currentProfile}
                >
                    {isSaving ? "Salvataggio..." : "Salva"}
                </button>
            </div>
        </div>
    );
}
