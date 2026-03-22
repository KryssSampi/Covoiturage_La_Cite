'use client';

import { useState, useCallback, useMemo } from 'react';
import { differenceInHours } from 'date-fns';
import {
  PublishedTripViewData,
  ReservationStatus,
  ReserveButtonState,
  ViewerRole,
  TripViewSource,
} from '../types/published-trip.view.types';
import type { MapOverlayMode } from '../components/published-trip/ui/MapOverlay';
import { useTripActions } from '@/core/context/trip.context';

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
  const { requestReservation, isReserving } = useTripActions();

  const [isMapOverlayOpen, setMapOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<MapOverlayMode>('route');
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [localReservationStatus, setLocalReservationStatus] =
    useState<ReservationStatus>(existingReservation?.status ?? 'none');

  // ── Calcul de l'état du bouton selon la source URL ou le rôle standard ─
  const buttonState = useMemo((): ReserveButtonState => {
    // Si on arrive depuis une carte avec un statut spécifique, utiliser les états contextuels
    if (source === 'reservation' && sourceStatus) {
      switch (sourceStatus) {
        case 'confirmed':   return { kind: 'reservation-confirmed' };
        case 'in-progress':  return { kind: 'reservation-inprogress' };
        case 'cancelled':   return { kind: 'reservation-cancelled' };
        case 'pending':     return { kind: 'reservation-pending' };
        case 'completed':   return { kind: 'reservation-completed' };
        case 'rejected':    return { kind: 'reservation-rejected' };
        case 'imminent':    return { kind: 'reservation-imminent' };
      }
    }

    if (source === 'publishedtrip' && sourceStatus) {
      switch (sourceStatus) {
        case 'published':   return { kind: 'trip-published' };
        case 'full':        return { kind: 'trip-full' };
        case 'confirmed':   return { kind: 'trip-confirmed' };
        case 'in-progress':  return { kind: 'trip-inprogress' };
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

  // Envoi réel de la demande de réservation via le TripContext
  const confirmReservation = useCallback(async () => {
    try {
      await requestReservation({
        tripId: trip.id,
        driverId: trip.driver.id,
        pricePerSeat: trip.pricePerPassenger,
      });
      setLocalReservationStatus('pending');
      setConfirmModalOpen(false);
    } catch {
      // L'erreur est accessible via useTripActions().activeError
    }
  }, [requestReservation, trip.id, trip.driver.id, trip.pricePerPassenger]);

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
    isSubmitting: isReserving,
    openConfirmModal,
    closeConfirmModal,
    confirmReservation,
    openMapOverlay,
    openMapOverlayDeparture,
    openMapOverlayArrival,
    closeMapOverlay,
  };
}
