// core/services/location_service.ts

/**
 * Interface pour typer la réponse brute de Photon (GeoJSON)
 */
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

/**
 * Récupère des propositions de lieux via Photon (OpenStreetMap)
 * Priorise les résultats canadiens et formate l'adresse proprement.
 */
export async function getProposals(query: string): Promise<{ label: string; coordinates: [number, number] }[]> {
  if (query.length < 3) return [];

  try {
    // On demande un peu plus de résultats (limit=10) pour pouvoir filtrer/trier nous-mêmes
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=fr`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur réseau Photon");
    
    const result = await response.json();
    const features: PhotonFeature[] = result.features;

    // ─── LOGIQUE DE TRI & FILTRAGE ───
    
    // 1. On sépare les résultats : Canada vs Reste du monde
    const canadianResults = features.filter(f => f.properties.countrycode === "CA" || f.properties.country === "Canada");
    const internationalResults = features.filter(f => f.properties.countrycode !== "CA" && f.properties.country !== "Canada");

    // 2. On fusionne en mettant le Canada en premier
    const sortedFeatures = [...canadianResults, ...internationalResults].slice(0, 5);

    return sortedFeatures.map((f) => {
      const p = f.properties;
      
      // Construction d'un label intelligent et pro
      // [Nom/Rue] [Numéro], [Ville], [Code Postal], [Province/Pays]
      const mainPlace = p.name || p.street || "";
      const house = p.housenumber ? ` ${p.housenumber}` : "";
      const city = p.city ? `, ${p.city}` : "";
      const cp = p.postcode ? ` ${p.postcode}` : "";
      const state = p.state ? ` (${p.state})` : "";

      return {
        label: `${mainPlace}${house}${city}${cp}${state}`.replace(/\s+/g, ' ').trim(),
        coordinates: f.geometry.coordinates // Photon renvoie toujours [lng, lat]
      };
    });
  } catch (error) {
    console.error("Erreur GetProposals:", error);
    return [];
  }
}