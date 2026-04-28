'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInHours } from 'date-fns';
import {
  PublishedTripViewData,
  ReservationStatus,
  ReserveButtonState,
  ViewerRole,
  TripViewSource,
} from '../types/published-trip.view.types';
import type { MapOverlayMode } from '../components/published-trip/ui/MapOverlay';
import { useAppState } from '@/core/state/app_state';

// Délai d'attente après un refus (heures)
const REFUSAL_COOLDOWN_HOURS = 24;

interface UsePublishedTripViewProps {
  trip: PublishedTripViewData;
  viewerRole: ViewerRole;
  // Reservation existante de cet utilisateur sur ce trajet
  existingReservation?: {
    status: ReservationStatus;
    updatedAt: string; // ISO — utilisé pour calculer le cooldown
  };
  /** Source de navigation — d'où l'utilisateur vient */
  source?: TripViewSource;
  /** Statut de la carte source (ex: "confirmed", "published") */
  sourceStatus?: string;
}

export function usePublishedTripView({
  trip,
  viewerRole,
  existingReservation,
  source,
  sourceStatus,
}: UsePublishedTripViewProps) {
  const router = useRouter();
  const { userConnected } = useAppState();
  const passengerId = userConnected?.id;

  const [isMapOverlayOpen, setMapOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<MapOverlayMode>('route');
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReservationStatus, setLocalReservationStatus] =
    useState<ReservationStatus>(existingReservation?.status ?? 'none');
  const [reservationToast, setReservationToast] = useState<{
    isOpen: boolean;
    success: boolean;
    message: string;
  }>({ isOpen: false, success: false, message: '' });

  // ── Calcul de l'état du bouton selon la source URL ou le rôle standard ─
  const buttonState = useMemo((): ReserveButtonState => {
    // Si on arrive depuis une carte avec un statut spécifique, utiliser les états contextuels
    if (source === 'reservation' && sourceStatus) {
      switch (sourceStatus) {
        case 'confirmed':   return { kind: 'reservation-confirmed' };
        case 'in-progress':  return { kind: 'reservation-inprogress' };
        case 'in_progress': return { kind: 'reservation-inprogress' };
        case 'cancelled':   return { kind: 'reservation-cancelled' };
        case 'pending':     return { kind: 'reservation-pending' };
        case 'completed':   return { kind: 'reservation-completed' };
        case 'rejected':    return { kind: 'reservation-rejected' };
        case 'refused':     return { kind: 'reservation-rejected' };
        case 'imminent':    return { kind: 'reservation-imminent' };
      }
    }

    if (source === 'publishedtrip' && sourceStatus) {
      switch (sourceStatus) {
        case 'published':   return { kind: 'trip-published' };
        case 'full':        return { kind: 'trip-full' };
        case 'confirmed':   return { kind: 'trip-confirmed' };
        case 'in-progress':  return { kind: 'trip-inprogress' };
        case 'in_progress': return { kind: 'trip-inprogress' };
        case 'completed':   return { kind: 'trip-completed' };
        case 'cancelled':   return { kind: 'trip-cancelled' };
        case 'no-show':     return { kind: 'trip-noshow' };
        case 'imminent':    return { kind: 'trip-imminent' };
      }
    }

    // Comportement par défaut (accès direct à la page)
    if (viewerRole === 'driver_owner') return { kind: 'manage' };
    if (viewerRole === 'admin') return { kind: 'readonly' };
    if (trip.availableSeats === 0) return { kind: 'full' };

    switch (localReservationStatus) {
      case 'pending':
        return { kind: 'pending' };

      case 'confirmed':
        return { kind: 'confirmed' };

      case 'refused': {
        const refusedAt = existingReservation?.updatedAt ?? new Date().toISOString();
        const hoursElapsed = differenceInHours(new Date(), new Date(refusedAt));
        const hoursLeft = REFUSAL_COOLDOWN_HOURS - hoursElapsed;
        if (hoursLeft > 0) return { kind: 'cooldown', hoursLeft };
        return { kind: 'reserve' };
      }

      case 'cancelled':
      case 'none':
      default:
        return { kind: 'reserve' };
    }
  }, [viewerRole, trip.availableSeats, localReservationStatus, existingReservation, source, sourceStatus]);

  // ── Actions ──────────────────────────────────────────────
  const openConfirmModal = useCallback(() => {
    if (buttonState.kind !== 'reserve') return;
    setConfirmModalOpen(true);
  }, [buttonState]);

  const closeConfirmModal = useCallback(() => setConfirmModalOpen(false), []);

  // Envoi de la demande de réservation via POST /api/reservations
  const confirmReservation = useCallback(async () => {
    if (!passengerId) return;
    setConfirmModalOpen(false);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          seatsRequested: 1,
          pickupNote: '',
        }),
      });

      const data = await res.json() as { id?: string; error?: string };

      if (res.ok) {
        setLocalReservationStatus('pending');
        setReservationToast({ isOpen: true, success: true, message: data.id ?? '' });
      } else {
        setReservationToast({
          isOpen: true,
          success: false,
          message: data.error ?? 'Erreur serveur',
        });
      }
    } catch (err) {
      console.error('[usePublishedTripView] handleReservationRequest', err);
      setReservationToast({ isOpen: true, success: false, message: 'Erreur réseau' });
    } finally {
      setIsSubmitting(false);
    }
  }, [trip.id, passengerId]);

  // Callback du bouton OK/Fermer du toast
  const handleReservationToastOk = useCallback(() => {
    const wasSuccess = reservationToast.success;
    setReservationToast((prev) => ({ ...prev, isOpen: false }));

    if (wasSuccess && passengerId) {
      // Signaler au planificateur de scroller vers la zone trajets
      try { sessionStorage.setItem('plannerScrollToRides', '1'); } catch { /* sstorage indisponible */ }
      router.push(`/passenger/planifier/${passengerId}?showAll=true`);
    }
  }, [reservationToast.success, passengerId, router]);

  // Ouvre l'overlay dans le mode 'route' (polyline complète)
  const openMapOverlay = useCallback(() => {
    setOverlayMode('route');
    setMapOverlayOpen(true);
  }, []);

  // Ouvre l'overlay centré sur le point de départ
  const openMapOverlayDeparture = useCallback(() => {
    setOverlayMode('departure');
    setMapOverlayOpen(true);
  }, []);

  // Ouvre l'overlay centré sur le point d'arrivée
  const openMapOverlayArrival = useCallback(() => {
    setOverlayMode('arrival');
    setMapOverlayOpen(true);
  }, []);

  const closeMapOverlay = useCallback(() => setMapOverlayOpen(false), []);

  return {
    buttonState,
    isMapOverlayOpen,
    overlayMode,
    isConfirmModalOpen,
    isSubmitting,
    reservationToast,
    openConfirmModal,
    closeConfirmModal,
    confirmReservation,
    handleReservationToastOk,
    openMapOverlay,
    openMapOverlayDeparture,
    openMapOverlayArrival,
    closeMapOverlay,
  };
}
