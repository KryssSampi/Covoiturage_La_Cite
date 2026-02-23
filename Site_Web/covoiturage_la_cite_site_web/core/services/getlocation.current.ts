// core/services/location_service.ts

/**
 * Convertit des coordonnées en adresse lisible via OpenStreetMap Nominatim
 */
export async function getAddressFromCoords(lat: number, lon: number): Promise<string> {
  try {
    // zoom=18 permet d'avoir la précision au niveau du bâtiment/numéro de rue
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'fr', // On veut l'adresse en français
        'User-Agent': 'CovoiturageLaCite-App' // Requis par la politique d'usage d'OSM
      }
    });

    if (!response.ok) throw new Error("Erreur Reverse Geocoding");
    
    const data = await response.json();
    
    // On construit l'adresse la plus pertinente
    const addr = data.address;
    const name = data.name || ""; // Le nom du bâtiment ou du lieu dit
    const street = addr.road || addr.pedestrian || "";
    const houseNumber = addr.house_number || "";
    const city = addr.city || addr.town || addr.village || "";

    // Si le lieu a un nom spécifique (ex: "Collège La Cité"), on le privilégie
    if (name && !street.includes(name)) {
      return `${name}, ${city}`.trim();
    }

    return `${houseNumber} ${street}, ${city}`.trim().replace(/^, /, "");
  } catch (error) {
    console.error("Erreur adresse:", error);
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`; // Fallback sur les coords si erreur
  }
}