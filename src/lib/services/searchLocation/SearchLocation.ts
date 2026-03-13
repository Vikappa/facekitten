import { LocationSearchResponse } from "@/lib/interfaces/LocationSearchResponses";

const GEOAPIFY_ENDPOINT = "https://api.geoapify.com/v1/geocode/search";

export const SearchLocation = async (queryText: string): Promise<LocationSearchResponse | null> => {
  const apiKey = process.env.GEOAPIFY_API_KEY ?? process.env.geoapifyapikey;
  const normalizedQuery = queryText.trim();

  if (!normalizedQuery || !apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    text: normalizedQuery,
    apiKey,
    limit: "10",
    lang: "it",
  });

  try {
    const response = await fetch(`${GEOAPIFY_ENDPOINT}?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Geoapify request failed:", response.status, response.statusText);
      return null;
    }

    const result = (await response.json()) as LocationSearchResponse;
    return result;
  } catch (error) {
    console.error("Error fetching locations:", error);
    return null;
  }
};
