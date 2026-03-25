/**
 * @file useReservationRequests.ts
 * @description Hook purement frontend pour les demandes de réservation du conducteur.
 *
 * Responsabilités :
 * - Tri des demandes : note décroissante → date/heure croissante
 * - Suppression optimiste des cartes acceptées/refusées
 * - Délégation des actions accepter / refuser aux callbacks parents
 *
 * Aucun appel API ni SSE — les callbacks métier sont injectés par la page parente.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { ReservationRequest, ReservationRequestCardModel } from "../types";

// ─── Callbacks injectés par la page parente ──────────────────────────────────

export interface ReservationRequestCallbacks {
  onAccept?: (id: string) => Promise<boolean>;
  onReject?: (id: string) => Promise<boolean>;
}

// ─── Types du hook ───────────────────────────────────────────────────────────

interface UseReservationRequestsReturn {
  /** Demandes triées et encapsulées, prêtes pour le rendu */
  requestModels: ReservationRequestCardModel[];
  /** État d'expansion UI par carte */
  isPassengerListOpens: { isPassengerListOpen: boolean }[];
  setIsPassengerListOpens: React.Dispatch<
    React.SetStateAction<{ isPassengerListOpen: boolean }[]>
  >;
  /** Accepte une demande : supprime la carte de façon optimiste puis délègue */
  acceptRequest: (id: string) => Promise<boolean>;
  /** Refuse une demande : supprime la carte de façon optimiste puis délègue */
  rejectRequest: (id: string) => Promise<boolean>;
  /** Indique si une action est en cours */
  isActionLoading: boolean;
}

// ─── Helper de tri ────────────────────────────────────────────────────────────

/**
 * Trie les demandes selon la règle métier §3.2 :
 * 1. Par note de l'applicant décroissante (les plus fiables d'abord)
 * 2. Par date+heure croissante (les créneaux les plus proches d'abord)
 */
function organizeRequests(requests: ReservationRequest[]): ReservationRequest[] {
  return [...requests].sort((a, b) => {
    const noteDiff = b.applicant.note - a.applicant.note;
    if (noteDiff !== 0) return noteDiff;
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useReservationRequests(
  initialRequests: ReservationRequest[],
  callbacks?: ReservationRequestCallbacks,
): UseReservationRequestsReturn {
  // Liste locale des demandes — initialisée depuis les props
  const [requests, setRequests] = useState<ReservationRequest[]>(initialRequests);
  // IDs des demandes supprimées de façon optimiste (en attente de confirmation)
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Synchroniser si les props changent (rechargement dashboard)
  useEffect(() => {
    if (initialRequests.length > 0) {
      setRequests(initialRequests);
    }
  }, [initialRequests]);

  // ── Modèles triés + filtrés (exclusion des cartes supprimées) ──────────────
  const requestModels = useMemo<ReservationRequestCardModel[]>(
    () =>
      organizeRequests(requests)
        .filter((r) => !removedIds.has(String(r.id)))
        .map((request) => ({
          request,
          isPassengerListOpen: false,
        })),
    [requests, removedIds],
  );

  const [isPassengerListOpens, setIsPassengerListOpens] = useState<
    { isPassengerListOpen: boolean }[]
  >([]);

  // Ajuster la taille de isPassengerListOpens quand la liste change
  useEffect(() => {
    setIsPassengerListOpens((prev) => {
      if (prev.length === requestModels.length) return prev;
      return requestModels.map((_, i) => prev[i] ?? { isPassengerListOpen: false });
    });
  }, [requestModels.length]);

  // ── Accepter une demande (optimiste → callback parent) ─────────────────────
  const acceptRequest = useCallback(async (id: string): Promise<boolean> => {
    setIsActionLoading(true);
    // Suppression optimiste de la carte
    setRemovedIds((prev) => new Set(prev).add(id));
    try {
      const ok = await (callbacks?.onAccept?.(id) ?? Promise.resolve(false));
      if (!ok) {
        // Restaurer la carte en cas d'échec
        setRemovedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return false;
      }
      return true;
    } catch {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [callbacks]);

  // ── Refuser une demande (optimiste → callback parent) ──────────────────────
  const rejectRequest = useCallback(async (id: string): Promise<boolean> => {
    setIsActionLoading(true);
    // Suppression optimiste de la carte
    setRemovedIds((prev) => new Set(prev).add(id));
    try {
      const ok = await (callbacks?.onReject?.(id) ?? Promise.resolve(false));
      if (!ok) {
        setRemovedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return false;
      }
      return true;
    } catch {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [callbacks]);

  return {
    requestModels,
    isPassengerListOpens,
    setIsPassengerListOpens,
    acceptRequest,
    rejectRequest,
    isActionLoading,
  };
}
