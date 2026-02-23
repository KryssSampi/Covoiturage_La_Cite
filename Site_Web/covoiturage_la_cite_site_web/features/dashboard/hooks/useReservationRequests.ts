/**
 * @file useReservationRequests.ts
 * @description Hook gérant la logique des demandes de réservation du conducteur.
 * Extrait de reservation_requests_section.tsx.
 *
 * Responsabilités :
 * - Tri des demandes : note décroissante → date/heure croissante
 *   (priorité aux passagers les mieux notés, dans les créneaux les plus proches)
 * - Encapsulation en modèles de carte
 * - Gestion de l'état d'expansion UI par carte
 *
 * @param requests Liste brute des demandes de réservation en attente
 */

import { useMemo, useState } from "react";
import { ReservationRequest, ReservationRequestCardModel } from "../types";

// ─── Types du hook ───────────────────────────────────────────────────────────

interface UseReservationRequestsReturn {
  /** Demandes triées et encapsulées, prêtes pour le rendu */
  requestModels: ReservationRequestCardModel[];
  /** État d'expansion UI par carte (non utilisé pour l'instant, prévu §22 push) */
  isPassengerListOpens: { isPassengerListOpen: boolean }[];
  setIsPassengerListOpens: React.Dispatch<
    React.SetStateAction<{ isPassengerListOpen: boolean }[]>
  >;
}

// ─── Helper de tri ────────────────────────────────────────────────────────────

/**
 * Trie les demandes selon la règle métier §3.2 :
 * 1. Par note de l'applicant décroissante (les plus fiables d'abord)
 * 2. Par date+heure croissante (les créneaux les plus proches d'abord)
 *
 * Note : utilise un spread pour garantir l'immutabilité (ne mute pas la prop).
 */
function organizeRequests(requests: ReservationRequest[]): ReservationRequest[] {
  return [...requests].sort((a, b) => {
    // Priorité 1 : note décroissante
    const noteDiff = b.applicant.note - a.applicant.note;
    if (noteDiff !== 0) return noteDiff;
    // Priorité 2 : date+heure croissante
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useReservationRequests(
  requests: ReservationRequest[],
): UseReservationRequestsReturn {
  // Tri mémoïsé — recalculé uniquement si la liste change
  const requestModels = useMemo<ReservationRequestCardModel[]>(
    () =>
      organizeRequests(requests).map((request) => ({
        request,
        isPassengerListOpen: false,
      })),
    [requests],
  );

  const [isPassengerListOpens, setIsPassengerListOpens] = useState(
    requestModels.map(() => ({ isPassengerListOpen: false })),
  );

  return { requestModels, isPassengerListOpens, setIsPassengerListOpens };
}
