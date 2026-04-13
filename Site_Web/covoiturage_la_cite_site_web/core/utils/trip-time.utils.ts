/**
 * @file trip-time.utils.ts
 * @description Utilitaires purs liés au temps des trajets.
 *
 * Aucune dépendance React ni feature — réutilisable partout
 * (services, hooks, converters, tests).
 */

/** Interface minimale requise — compatible TripModel et RawTrip */
export interface TripTimeInfo {
  departureDate: string;
  departureTime: string;
}

/**
 * Détermine si un trajet est imminent (départ dans les 2 prochaines heures).
 *
 * Fonction partagée entre :
 * - core/services/live-trips.service.ts
 * - features/dashboard/converters/dashboard.converter.ts
 */
export function isImminent(trip: TripTimeInfo): boolean {
  if (!trip || !trip.departureDate || !trip.departureTime) return false;

  const now = new Date();

  // Try to interpret server-provided date/time as UTC (frontend contract: server sends UTC)
  const utcIso = `${trip.departureDate}T${trip.departureTime}:00Z`;
  let departureDateTime = new Date(utcIso);

  // Fallback: if parsing failed, try local parsing for backwards compatibility
  if (isNaN(departureDateTime.getTime())) {
    departureDateTime = new Date(`${trip.departureDate}T${trip.departureTime}:00`);
    if (isNaN(departureDateTime.getTime())) return false;
  }

  const diffMs = departureDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= 2;
}
