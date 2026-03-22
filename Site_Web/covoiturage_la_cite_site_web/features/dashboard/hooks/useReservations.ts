// features/dashboard/hooks/useReservations.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// ─── Interface de retour ──────────────────────────────────────────────────────

interface UseReservationsReturn {
  reservations: Reservation[];
  isEmpty: boolean;
  openPassengerLists: boolean[];
  togglePassengerList: (index: number) => void;
  closePassengerList: (index: number) => void;
  /** Annule une réservation via l'API */
  cancelReservation: (reservationId: string, raison?: string) => Promise<boolean>;
  /** Démarre un trajet (réservation confirmed → in_progress) via l'API */
  startReservation: (reservationId: string) => Promise<string | null>;
  /** Indique si une action est en cours */
  isActionLoading: boolean;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useReservations(
  rawReservations: Reservation[],
  passengerId?: string | null
): UseReservationsReturn {
  // Données locales mises à jour via SSE
  const [liveReservations, setLiveReservations] = useState<Reservation[] | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Abonnement SSE pour les mises à jour en temps réel
  useEffect(() => {
    if (!passengerId) return;

    const es = new EventSource('/api/sse/db-watch/reservations');
    eventSourceRef.current = es;

    es.addEventListener('update', () => {
      // Quand les réservations changent en DB, re-fetch les données converties du dashboard
      fetch(`/api/dashboard/passenger/${passengerId}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.reservations) {
            setLiveReservations(data.reservations);
          }
        })
        .catch(() => { /* Erreur silencieuse — le prochain événement SSE réessaiera */ });
    });

    es.onerror = () => {
      // Reconnexion automatique gérée par EventSource
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [passengerId]);

  // Source de données : SSE si disponible, sinon props initiales
  const source = liveReservations ?? rawReservations;
  const reservations = useMemo(() => sortReservations(source), [source]);

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

  // ─── Actions métier ─────────────────────────────────────────────────────────

  /** Annule une réservation via POST /api/reservations/[id]/cancel */
  const cancelReservation = useCallback(async (reservationId: string, raison?: string): Promise<boolean> => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raison }),
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  /** Démarre une réservation — retourne le tripId pour la redirection */
  const startReservation = useCallback(async (reservationId: string): Promise<string | null> => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.tripId ?? null;
    } catch {
      return null;
    } finally {
      setIsActionLoading(false);
    }
  }, []);

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
