/**
 * @file osrm.service.ts
 * @description Re-export shim + helpers de routage passager.
 * La logique principale est dans core/services/routing.service.ts
 */
export { fetchRoute, fetchCircuits } from '@/core/services/routing.service';

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

/**
 * Récupère le tracé OSRM entre deux points pour afficher la route d'un trip sélectionné.
 * Retourne les coordonnées [lat, lng] pour Leaflet.
 * En cas d'erreur réseau, retourne un tableau vide (le composant utilisera son fallback).
 *
 * @param depLng Longitude du point de départ
 * @param depLat Latitude du point de départ
 * @param arrLng Longitude du point d'arrivée
 * @param arrLat Latitude du point d'arrivée
 */
export async function fetchTripRoute(
  depLng: number, depLat: number,
  arrLng: number, arrLat: number,
): Promise<[number, number][]> {
  try {
    const url = `${OSRM_BASE}/${depLng},${depLat};${arrLng},${arrLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = await res.json();
    if (!data.routes?.length) throw new Error("Aucun itinéraire OSRM");
    return data.routes[0].geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
    );
  } catch {
    return [];
  }
}
