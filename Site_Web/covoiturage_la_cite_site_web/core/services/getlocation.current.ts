/**
 * @file getlocation.current.ts
 * @description Reverse geocoding robuste via Nominatim (OpenStreetMap).
 *
 * Stratégie de résilience :
 * 1. Timeout configurable sur le fetch (évite les attentes infinies)
 * 2. Retry automatique (3 tentatives avec backoff exponentiel)
 * 3. Fallback gracieux : jamais de coordonnées brutes exposées à l'utilisateur
 *
 * Politique d'usage Nominatim :
 * - Max 1 requête/seconde par IP
 * - User-Agent obligatoire
 * - Pas d'usage commercial intensif
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

const CONFIG = {
  /** Timeout par tentative en ms */
  timeoutMs: 6000,
  /** Nombre de tentatives maximum */
  maxRetries: 3,
  /** Délai initial entre tentatives (ms) — doublé à chaque retry */
  retryDelayMs: 800,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface NominatimResponse {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  error?: string;
}

// ─── Utilitaires internes ─────────────────────────────────────────────────────

/**
 * Fetch avec timeout via AbortController.
 * Lève une erreur si le délai est dépassé.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Pause asynchrone.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extrait le libellé le plus lisible possible depuis la réponse Nominatim.
 * Priorité : rue + numéro → quartier → ville → commune → région
 */
function extractReadableAddress(data: NominatimResponse): string {
  const { address } = data;

  // Rue avec numéro (le plus précis)
  if (address.road) {
    const parts = [address.house_number, address.road].filter(Boolean);
    const street = parts.join(" ");
    const city =
      address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      "";
    return city ? `${street}, ${city}` : street;
  }

  // Quartier / arrondissement
  if (address.neighbourhood ?? address.suburb) {
    const zone = (address.neighbourhood ?? address.suburb)!;
    const city =
      address.city ?? address.town ?? address.village ?? address.municipality ?? "";
    return city ? `${zone}, ${city}` : zone;
  }

  // Ville / commune
  const city =
    address.city ??
    address.town ??
    address.village ??
    address.municipality;
  if (city) return city;

  // Région en dernier recours
  if (address.county ?? address.state) {
    return (address.county ?? address.state)!;
  }

  // Fallback Nominatim : display_name complet (toujours lisible)
  return data.display_name;
}

// ─── Fonction principale ──────────────────────────────────────────────────────

/**
 * Convertit des coordonnées GPS en adresse lisible via Nominatim.
 *
 * - Retry automatique (3x, backoff exponentiel)
 * - Timeout par tentative (6s)
 * - Ne retourne JAMAIS de coordonnées brutes
 * - En cas d'échec total → retourne null (le caller gère l'UI)
 *
 * @param lat Latitude
 * @param lon Longitude
 * @returns Adresse lisible ou null si toutes les tentatives échouent
 *
 * @example
 * const address = await getAddressFromCoords(45.4215, -75.6972);
 * // → "150 Elgin Street, Ottawa" ou null
 */
export async function getAddressFromCoords(
  lat: number,
  lon: number,
): Promise<string | null> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lon.toString());
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");

  const options: RequestInit = {
    headers: {
      "Accept-Language": "fr",
      "User-Agent": "CovoiturageLaCite-App",
      Accept: "application/json",
    },
  };

  let lastError: unknown;

  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        url.toString(),
        options,
        CONFIG.timeoutMs,
      );

      if (!response.ok) {
        // 429 = rate limit Nominatim → attente plus longue avant retry
        const delay =
          response.status === 429
            ? CONFIG.retryDelayMs * attempt * 3
            : CONFIG.retryDelayMs * attempt;

        console.warn(
          `[Geocoding] Tentative ${attempt}/${CONFIG.maxRetries} échouée (HTTP ${response.status}) — retry dans ${delay}ms`,
        );
        lastError = new Error(`HTTP ${response.status}`);
        if (attempt < CONFIG.maxRetries) await sleep(delay);
        continue;
      }

      const data: NominatimResponse = await response.json();

      if (data.error) {
        console.warn("[Geocoding] Nominatim error:", data.error);
        return null;
      }

      return extractReadableAddress(data);
    } catch (error) {
      lastError = error;
      const isAbort =
        error instanceof Error && error.name === "AbortError";

      console.warn(
        `[Geocoding] Tentative ${attempt}/${CONFIG.maxRetries} échouée (${
          isAbort ? "timeout" : "réseau"
        })`,
      );

      if (attempt < CONFIG.maxRetries) {
        await sleep(CONFIG.retryDelayMs * attempt);
      }
    }
  }

  console.error("[Geocoding] Toutes les tentatives ont échoué :", lastError);
  return null;
}