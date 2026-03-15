import { ILocationOptions } from "@/lib/interfaces/LocationOptions";
import { Feature } from "@/lib/interfaces/LocationSearchResponses";

type PlaceDetailsResponse = {
  features?: Feature[];
};

const GEOAPIFY_ENDPOINT = "https://api.geoapify.com/v2/place-details";

const buildLocationDescription = (location: Feature) => {
  const { address_line1, address_line2, formatted } = location.properties;
  const fromAddressLines = `${address_line1} ${address_line2}`.trim();
  return fromAddressLines || formatted;
};

export const GetLocationById = async (placeId: string): Promise<ILocationOptions | null> => {
  const apiKey = process.env.GEOAPIFY_API_KEY ?? process.env.geoapifyapikey;
  const normalizedPlaceId = placeId.trim();

  if (!normalizedPlaceId || !apiKey) {
    return null;
  }

  const params = new URLSearchParams({ id: normalizedPlaceId, apiKey });

  try {
    const response = await fetch(`${GEOAPIFY_ENDPOINT}?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });


    if (!response.ok) {
      console.error("Geoapify location by id request failed:", response.status, response.statusText);
      return null;
    }

    const result = (await response.json()) as PlaceDetailsResponse;
    const firstFeature = result.features?.[0];

    if (!firstFeature) {
      return null;
    }

    return {
      id: firstFeature.properties.place_id,
      descr: buildLocationDescription(firstFeature),
    };
  } catch (error) {
    console.error("Error fetching location by id:", error);
    return null;
  }
};
