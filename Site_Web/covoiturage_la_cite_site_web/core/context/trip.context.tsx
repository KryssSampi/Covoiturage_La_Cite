'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { TripService } from '@/core/services/trip.service';
import { ReservationService } from '@/core/services/reservation.service';
import { NotificationService } from '@/core/services/notification.service';
import type { TripModel } from '@/core/models/TripModel';
import type { ReservationModel } from '@/core/models/ReservationModel';
import { useDb } from './db.context';
import { useAppState } from '@/core/state/app_state';
import { DEFAULT_TRIP_PREFERENCES } from '@/core/models/TripModel';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripContextType {
  // Création d'un trajet
  createTrip: (data: Omit<TripModel, 'id' | 'createdAt' | 'updatedAt' | 'passengerIds'>) => Promise<TripModel>;
  isCreating: boolean;

  // Démarrage d'un trajet
  startTrip: (tripId: string) => Promise<void>;
  completeTrip: (tripId: string) => Promise<void>;
  cancelTrip: (tripId: string) => Promise<void>;

  // Réservation (côté passager)
  requestReservation: (params: ReservationRequestParams) => Promise<ReservationModel>;
  cancelReservation: (reservationId: string, reason?: string) => Promise<void>;
  isReserving: boolean;

  // Gestion des demandes (côté conducteur)
  acceptReservation: (reservationId: string) => Promise<void>;
  refuseReservation: (reservationId: string, reason?: string) => Promise<void>;

  // Embarquement
  confirmBoardingAsDriver: (reservationId: string) => Promise<void>;
  confirmBoardingAsPassenger: (reservationId: string) => Promise<void>;

  // État opérationnel courant
  activeError: string | null;
  clearError: () => void;
}

interface ReservationRequestParams {
  tripId: string;
  driverId: string;
  pricePerSeat: number;
  message?: string;
}

// ─── Contexte ─────────────────────────────────────────────────────────────────

const TripContext = createContext<TripContextType | null>(null);

export function useTripActions(): TripContextType {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripActions doit être utilisé dans un <TripProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TripProvider({ children }: { children: React.ReactNode }) {
  const appState = useAppState();
  const currentUser = appState.userConnected;
  const { refreshTrips, refreshReservations, refreshNotifications } = useDb();

  const [isCreating, setIsCreating] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);

  const clearError = useCallback(() => setActiveError(null), []);

  // ─── Création d'un trajet ──────────────────────────────────────────────────

  const createTrip = useCallback(
    async (
      data: Omit<TripModel, 'id' | 'createdAt' | 'updatedAt' | 'passengerIds'>
    ): Promise<TripModel> => {
      setIsCreating(true);
      setActiveError(null);

      try {
        const now = new Date().toISOString();
        const trip: TripModel = {
          ...data,
          id: TripService.generateId(),
          passengerIds: [],
          preferences: { ...DEFAULT_TRIP_PREFERENCES, ...data.preferences },
          createdAt: now,
          updatedAt: now,
        };

        await TripService.create(trip);

        // Notification système (conducteur publie un trajet)
        if (currentUser) {
          await NotificationService.createForEvent({
            userId: currentUser.id,
            type: 'system',
            title: 'Trajet publié avec succès',
            message: `Votre trajet ${trip.departure.label} → ${trip.arrival.label} du ${trip.departureDate} a été publié.`,
            link: `/trajets/${trip.id}`,
            relatedTripId: trip.id,
            isImportant: false,
          });
        }

        await Promise.all([refreshTrips(), refreshNotifications()]);
        return trip;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
        setActiveError(msg);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [currentUser, refreshTrips, refreshNotifications]
  );

  // ─── Démarrage / completion ────────────────────────────────────────────────

  const startTrip = useCallback(
    async (tripId: string) => {
      try {
        const trip = await TripService.getById(tripId);
        if (!trip) throw new Error('Trajet introuvable');

        // Passe toutes les réservations confirmées à in_progress
        const reservations = await ReservationService.getByTripId(tripId);
        await Promise.all(
          reservations
            .filter((r) => r.status === 'confirmed')
            .map((r) =>
              ReservationService.updateStatus(r.id, 'in_progress')
            )
        );

        await TripService.start(tripId);

        // Notifications aux passagers
        await Promise.all(
          trip.passengerIds.map((passengerId) =>
            NotificationService.createForEvent({
              userId: passengerId,
              type: 'trip_started',
              title: 'Votre trajet a démarré!',
              message: `Le trajet ${trip.departure.label} → ${trip.arrival.label} vient de démarrer.`,
              link: `/trajet-en-cours/${tripId}`,
              relatedTripId: tripId,
              isImportant: true,
            })
          )
        );

        await Promise.all([refreshTrips(), refreshReservations(), refreshNotifications()]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur lors du démarrage';
        setActiveError(msg);
        throw err;
      }
    },
    [refreshTrips, refreshReservations, refreshNotifications]
  );

  const completeTrip = useCallback(
    async (tripId: string) => {
      try {
        await TripService.complete(tripId);
        await ReservationService.completeAllForTrip(tripId);

        const trip = await TripService.getById(tripId);
        if (trip) {
          await Promise.all(
            trip.passengerIds.map((passengerId) =>
              NotificationService.createForEvent({
                userId: passengerId,
                type: 'trip_completed',
                title: 'Trajet terminé!',
                message: `Votre trajet ${trip.departure.label} → ${trip.arrival.label} est terminé. N'oubliez pas d'évaluer votre trajet!`,
                link: `/passenger/reservations`,
                relatedTripId: tripId,
                isImportant: false,
              })
            )
          );
        }

        await Promise.all([refreshTrips(), refreshReservations(), refreshNotifications()]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur lors de la complétion';
        setActiveError(msg);
        throw err;
      }
    },
    [refreshTrips, refreshReservations, refreshNotifications]
  );

  const cancelTrip = useCallback(
    async (tripId: string) => {
      try {
        await TripService.cancel(tripId);

        // Annule toutes les réservations actives
        const reservations = await ReservationService.getByTripId(tripId);
        await Promise.all(
          reservations
            .filter((r) => ['pending', 'confirmed'].includes(r.status))
            .map((r) => ReservationService.cancel(r.id, 'Trajet annulé par le conducteur'))
        );

        const trip = await TripService.getById(tripId);
        if (trip) {
          await Promise.all(
            trip.passengerIds.map((passengerId) =>
              NotificationService.createForEvent({
                userId: passengerId,
                type: 'trip_cancelled',
                title: 'Trajet annulé',
                message: `Le trajet ${trip.departure.label} → ${trip.arrival.label} a été annulé par le conducteur.`,
                link: `/passenger/reservations`,
                relatedTripId: tripId,
                isImportant: true,
              })
            )
          );
        }

        await Promise.all([refreshTrips(), refreshReservations(), refreshNotifications()]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur lors de l\'annulation';
        setActiveError(msg);
        throw err;
      }
    },
    [refreshTrips, refreshReservations, refreshNotifications]
  );

  // ─── Réservation ──────────────────────────────────────────────────────────

  const requestReservation = useCallback(
    async (params: ReservationRequestParams): Promise<ReservationModel> => {
      if (!currentUser) throw new Error('Utilisateur non connecté');
      setIsReserving(true);
      setActiveError(null);

      try {
        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const reservation: ReservationModel = {
          id: ReservationService.generateId(),
          tripId: params.tripId,
          passengerId: currentUser.id,
          driverId: params.driverId,
          status: 'pending',
          pricePerSeat: params.pricePerSeat,
          totalAmount: params.pricePerSeat,
          requestedAt: now,
          expiresAt,
          confirmedAt: undefined,
          cancelledAt: undefined,
          completedAt: undefined,
          passengerMessage: params.message,
          refusalReason: undefined,
          cancellationReason: undefined,
          boardingConfirmedByDriver: false,
          boardingConfirmedByPassenger: false,
          compatibilityScore: Math.floor(70 + Math.random() * 30),
          createdAt: now,
          updatedAt: now,
        };

        await ReservationService.create(reservation);

        const trip = await TripService.getById(params.tripId);
        if (trip) {
          // Notification au conducteur
          await NotificationService.createForEvent({
            userId: params.driverId,
            type: 'reservation_received',
            title: 'Nouvelle demande de réservation',
            message: `${currentUser.firstName} ${currentUser.lastName} demande à rejoindre votre trajet ${trip.departure.label} → ${trip.arrival.label}.`,
            link: `/driver/reservations`,
            relatedTripId: params.tripId,
            relatedReservationId: reservation.id,
            isImportant: true,
          });

          // Notification au passager (confirmation d'envoi)
          await NotificationService.createForEvent({
            userId: currentUser.id,
            type: 'system',
            title: 'Demande envoyée',
            message: `Votre demande pour le trajet ${trip.departure.label} → ${trip.arrival.label} a été envoyée au conducteur.`,
            link: `/passenger/reservations`,
            relatedTripId: params.tripId,
            relatedReservationId: reservation.id,
            isImportant: false,
          });
        }

        await Promise.all([refreshReservations(), refreshNotifications()]);
        return reservation;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur lors de la réservation';
        setActiveError(msg);
        throw err;
      } finally {
        setIsReserving(false);
      }
    },
    [currentUser, refreshReservations, refreshNotifications]
  );

  const cancelReservation = useCallback(
    async (reservationId: string, reason?: string) => {
      try {
        await ReservationService.cancel(reservationId, reason);
        await Promise.all([refreshTrips(), refreshReservations()]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur lors de l\'annulation';
        setActiveError(msg);
        throw err;
      }
    },
    [refreshTrips, refreshReservations]
  );

  // ─── Gestion des demandes (conducteur) ────────────────────────────────────

  const acceptReservation = useCallback(
    async (reservationId: string) => {
      try {
        const reservation = await ReservationService.getById(reservationId);
        if (!reservation) throw new Error('Réservation introuvable');

        await ReservationService.accept(reservationId);

        const trip = await TripService.getById(reservation.tripId);

        // Notification au passager
        await NotificationService.createForEvent({
          userId: reservation.passengerId,
          type: 'reservation_accepted',
          title: 'Réservation confirmée!',
          message: trip
            ? `Votre demande pour ${trip.departure.label} → ${trip.arrival.label} a été acceptée.`
            : 'Votre demande de réservation a été acceptée.',
          link: `/passenger/reservations`,
          relatedTripId: reservation.tripId,
          relatedReservationId: reservationId,
          isImportant: true,
        });

        await Promise.all([refreshTrips(), refreshReservations(), refreshNotifications()]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur lors de l\'acceptation';
        setActiveError(msg);
        throw err;
      }
    },
    [refreshTrips, refreshReservations, refreshNotifications]
  );

  const refuseReservation = useCallback(
    async (reservationId: string, reason?: string) => {
      try {
        const reservation = await ReservationService.getById(reservationId);
        if (!reservation) throw new Error('Réservation introuvable');

        await ReservationService.refuse(reservationId, reason);

        const trip = await TripService.getById(reservation.tripId);

        // Notification au passager
        await NotificationService.createForEvent({
          userId: reservation.passengerId,
          type: 'reservation_refused',
          title: 'Demande refusée',
          message: trip
            ? `Votre demande pour ${trip.departure.label} → ${trip.arrival.label} n'a pas été retenue.`
            : 'Votre demande de réservation n\'a pas été retenue.',
          link: `/passenger/reservations`,
          relatedTripId: reservation.tripId,
          relatedReservationId: reservationId,
          isImportant: false,
        });

        await Promise.all([refreshReservations(), refreshNotifications()]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur lors du refus';
        setActiveError(msg);
        throw err;
      }
    },
    [refreshReservations, refreshNotifications]
  );

  // ─── Embarquement ─────────────────────────────────────────────────────────

  const confirmBoardingAsDriver = useCallback(
    async (reservationId: string) => {
      try {
        await ReservationService.confirmBoardingByDriver(reservationId);
        await refreshReservations();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur embarquement';
        setActiveError(msg);
        throw err;
      }
    },
    [refreshReservations]
  );

  const confirmBoardingAsPassenger = useCallback(
    async (reservationId: string) => {
      try {
        await ReservationService.confirmBoardingByPassenger(reservationId);
        await refreshReservations();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur embarquement';
        setActiveError(msg);
        throw err;
      }
    },
    [refreshReservations]
  );

  return (
    <TripContext.Provider
      value={{
        createTrip,
        isCreating,
        startTrip,
        completeTrip,
        cancelTrip,
        requestReservation,
        cancelReservation,
        isReserving,
        acceptReservation,
        refuseReservation,
        confirmBoardingAsDriver,
        confirmBoardingAsPassenger,
        activeError,
        clearError,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}
