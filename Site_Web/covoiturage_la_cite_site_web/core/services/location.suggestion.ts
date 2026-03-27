// core/services/location.suggestion.ts

export interface LocationSuggestion {
  label: string;
  coordinates: [number, number];
}

/**
 * Récupère des propositions via l'API interne (proxy Photon côté serveur).
 * Empêche les erreurs CORS dans le navigateur.
 */
export async function getProposals(query: string): Promise<LocationSuggestion[]> {
  if (query.length < 3) return [];

  try {
    const res = await fetch(`/api/locations/suggestions?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { suggestions: LocationSuggestion[] };
    return data.suggestions ?? [];
  } catch (error) {
    console.error("Erreur GetProposals:", error);
    return [];
  }
}
