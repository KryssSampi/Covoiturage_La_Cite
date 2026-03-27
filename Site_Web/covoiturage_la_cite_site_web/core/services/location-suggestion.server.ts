// core/services/location-suggestion.server.ts

interface PhotonFeature {
  properties: {
    name?: string;
    city?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
    country?: string;
    countrycode?: string;
    state?: string;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface LocationSuggestion {
  label: string;
  coordinates: [number, number];
}

export async function fetchPhotonSuggestions(query: string): Promise<LocationSuggestion[]> {
  if (query.length < 3) return [];

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=fr`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!response.ok) throw new Error("Erreur réseau Photon");

    const result = await response.json();
    const features: PhotonFeature[] = result.features;

    const canadianResults = features.filter(
      (f) => f.properties.countrycode === "CA" || f.properties.country === "Canada"
    );
    const internationalResults = features.filter(
      (f) => f.properties.countrycode !== "CA" && f.properties.country !== "Canada"
    );

    const sortedFeatures = [...canadianResults, ...internationalResults].slice(0, 5);

    return sortedFeatures.map((f) => {
      const p = f.properties;
      const mainPlace = p.name || p.street || "";
      const house = p.housenumber ? ` ${p.housenumber}` : "";
      const city = p.city ? `, ${p.city}` : "";
      const cp = p.postcode ? ` ${p.postcode}` : "";
      const state = p.state ? ` (${p.state})` : "";

      return {
        label: `${mainPlace}${house}${city}${cp}${state}`.replace(/\s+/g, " ").trim(),
        coordinates: f.geometry.coordinates,
      };
    });
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError") {
      console.error("Erreur fetchPhotonSuggestions:", error);
    }
    return [];
  }
}
