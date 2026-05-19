'use client'

import { useEffect, useState } from "react";

import { SearchResultLi, type SearchResultProfile } from "./SearchResultLi";

interface SearchResultOlProps {
    query: string;
    isVisible?: boolean;
    onSelect?: () => void;
}

function isSearchResultProfile(value: unknown): value is SearchResultProfile {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
        typeof candidate.id === "string" &&
        (candidate.username === null || typeof candidate.username === "string") &&
        (candidate.avatarUrl === null || typeof candidate.avatarUrl === "string")
    );
}

export function SearchResultOl({
    query,
    isVisible = true,
    onSelect,
}: SearchResultOlProps) {
    const normalizedQuery = query.trim();
    const [results, setResults] = useState<SearchResultProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isVisible || normalizedQuery.length < 2) {
            setResults([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        const abortController = new AbortController();
        const timeoutId = window.setTimeout(async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/v1/search/profiles?query=${encodeURIComponent(normalizedQuery)}`,
                    {
                        signal: abortController.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error("SEARCH_FAILED");
                }

                const payload = await response.json();
                const nextResults = Array.isArray(payload)
                    ? payload.filter(isSearchResultProfile)
                    : [];

                setResults(nextResults);
            } catch (err) {
                if (abortController.signal.aborted) {
                    return;
                }

                console.error("Errore ricerca profili navbar:", err);
                setResults([]);
                setError("Ricerca non disponibile");
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, 250);

        return () => {
            window.clearTimeout(timeoutId);
            abortController.abort();
        };
    }, [isVisible, normalizedQuery]);

    if (!isVisible || normalizedQuery.length < 2) {
        return null;
    }

    return (
        <div className="absolute left-2 top-12 z-50 w-[min(88vw,22rem)] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg md:left-2 md:w-80">
            {
                isLoading && results.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-gray-500">Ricerca...</p>
                ) : error ? (
                    <p className="px-3 py-3 text-sm text-red-600">{error}</p>
                ) : results.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-gray-500">Nessun profilo trovato</p>
                ) : (
                    <ol className="max-h-80 overflow-y-auto py-1">
                        {
                            results.map((profile) => (
                                <SearchResultLi
                                    key={profile.id}
                                    data={profile}
                                    onSelect={onSelect}
                                />
                            ))
                        }
                    </ol>
                )
            }
        </div>
    );
}
