/**
 * @file presentation-sort.utils.ts
 * @description Fonctions pures de tri et d'organisation pour l'affichage
 *              des demandes de réservation et des trajets publiés.
 *
 * Extraites depuis :
 * - useReservationRequests.ts → organizeRequests
 * - usePublishedTrips.ts     → organizeTrips
 */

import type { ReservationRequest } from "../types";
import type { PublishedTrip } from "../types";
import { PublishedTripStatus } from "../types";

// ─── Tri des demandes de réservation ─────────────────────────────────────────

/**
 * Trie les demandes selon la règle métier §3.2 :
 * 1. Par note de l'applicant décroissante (les plus fiables d'abord)
 * 2. Par date+heure croissante (les créneaux les plus proches d'abord)
 */
export function organizeRequests(requests: ReservationRequest[]): ReservationRequest[] {
  return [...requests].sort((a, b) => {
    const noteDiff = b.applicant.note - a.applicant.note;
    if (noteDiff !== 0) return noteDiff;
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });
}

// ─── Tri des trajets publiés ─────────────────────────────────────────────────

/**
 * Ordre de priorité d'affichage des trajets dans la liste :
 * 1. En cours (InProgress) — toujours en premier, GPS actif
 * 2. Complets / À venir confirmés — triés par date croissante
 * 3. Publiés en attente (Published) — tri date croissante
 * 4. Annulés — tri date décroissante
 *
 * Les trajets complétés et no-show sont exclus (filtrés en amont par le hook SSE).
 */
export function organizeTrips(trips: PublishedTrip[]): PublishedTrip[] {
  const inProgress = trips.filter(t => t.status === PublishedTripStatus.InProgress);
  const upcoming = trips
    .filter(t => [PublishedTripStatus.Confirmed, PublishedTripStatus.Full].includes(t.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pending = trips
    .filter(t => t.status === PublishedTripStatus.Published)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const cancelled = trips
    .filter(t => t.status === PublishedTripStatus.Cancelled)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return [...inProgress, ...upcoming, ...pending, ...cancelled];
}
