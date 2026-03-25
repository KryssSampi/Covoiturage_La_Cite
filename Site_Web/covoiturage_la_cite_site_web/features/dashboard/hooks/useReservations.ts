// features/dashboard/hooks/useReservations.ts
// Hook purement frontend : tri, UI des listes de passagers, délégation des callbacks.
// Aucun appel API ni SSE — les actions métier sont injectées par la page parente.

import { useEffect, useMemo, useState } from "react";
import { ReservationStatus, type Reservation } from "../types";

// ─── Tri déterministe des réservations par priorité de statut ─────────────────

function sortReservations(reservations: Reservation[]): Reservation[] {
  const inProgress = reservations.filter(r => r.status === ReservationStatus.InProgress);
  const upcoming   = reservations
    .filter(r => r.status === ReservationStatus.Confirmed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pending    = reservations
    .filter(r => r.status === ReservationStatus.Pending)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const cancelled  = reservations
    .filter(r => r.status === ReservationStatus.Cancelled)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const done       = reservations
    .filter(r => r.status === ReservationStatus.Completed)
    .sort((a, b) => new Date(b.doneDate!).getTime() - new Date(a.doneDate!).getTime());

  return [...inProgress, ...upcoming, ...pending, ...cancelled, ...done];
}

// ─── Callbacks injectés par la page parente ───────────────────────────────────

export interface ReservationCallbacks {
  /** Annule une réservation — appelé par la page qui détient la logique API */
  onCancel?: (reservationId: string, raison?: string) => Promise<boolean>;
  /** Démarre un trajet — retourne le tripId pour la redirection */
  onStart?: (reservationId: string) => Promise<string | null>;
}

// ─── Interface de retour ──────────────────────────────────────────────────────

interface UseReservationsReturn {
  reservations: Reservation[];
  isEmpty: boolean;
  openPassengerLists: boolean[];
  togglePassengerList: (index: number) => void;
  closePassengerList: (index: number) => void;
  /** Délègue l'annulation au callback parent */
  cancelReservation: (reservationId: string, raison?: string) => Promise<boolean>;
  /** Délègue le démarrage au callback parent */
  startReservation: (reservationId: string) => Promise<string | null>;
  /** Indique si une action est en cours */
  isActionLoading: boolean;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useReservations(
  rawReservations: Reservation[],
  callbacks?: ReservationCallbacks,
): UseReservationsReturn {
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Tri des réservations reçues en props
  const reservations = useMemo(() => sortReservations(rawReservations), [rawReservations]);

  const [openPassengerLists, setOpenPassengerLists] = useState<boolean[]>(
    () => reservations.map(() => false)
  );

  // Synchroniser la taille du tableau des listes de passagers
  useEffect(() => {
    setOpenPassengerLists((prev) => {
      if (prev.length === reservations.length) return prev;
      return reservations.map((_, i) => prev[i] ?? false);
    });
  }, [reservations.length]);

  const togglePassengerList = (index: number) =>
    setOpenPassengerLists((prev) => prev.map((v, i) => (i === index ? !v : v)));

  const closePassengerList = (index: number) =>
    setOpenPassengerLists((prev) => prev.map((v, i) => (i === index ? false : v)));

  // ─── Délégation des actions métier aux callbacks parents ────────────────────

  const cancelReservation = async (reservationId: string, raison?: string): Promise<boolean> => {
    if (!callbacks?.onCancel) return false;
    setIsActionLoading(true);
    try {
      return await callbacks.onCancel(reservationId, raison);
    } finally {
      setIsActionLoading(false);
    }
  };

  const startReservation = async (reservationId: string): Promise<string | null> => {
    if (!callbacks?.onStart) return null;
    setIsActionLoading(true);
    try {
      return await callbacks.onStart(reservationId);
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    reservations,
    isEmpty: reservations.length === 0,
    openPassengerLists,
    togglePassengerList,
    closePassengerList,
    cancelReservation,
    startReservation,
    isActionLoading,
  };
}
