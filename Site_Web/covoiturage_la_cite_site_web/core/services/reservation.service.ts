import { staticDb } from '@/tests/db/StaticDb';
import type { ReservationModel, ReservationLifecycleStatus } from '@/core/models/ReservationModel';
import { TripService } from './trip.service';

/**
 * ReservationService — Service de gestion des réservations
 * Applique la logique métier du cycle de vie des réservations
 */
export const ReservationService = {
  // ─── Lecture ────────────────────────────────────────────────────────────────

  async getAll(): Promise<ReservationModel[]> {
    return staticDb.getAll('reservations');
  },

  async getById(id: string): Promise<ReservationModel | null> {
    return staticDb.getById('reservations', id);
  },

  async getByPassengerId(passengerId: string): Promise<ReservationModel[]> {
    const all = await staticDb.getAll('reservations');
    return all.filter((r) => r.passengerId === passengerId);
  },

  async getByDriverId(driverId: string): Promise<ReservationModel[]> {
    const all = await staticDb.getAll('reservations');
    return all.filter((r) => r.driverId === driverId);
  },

  async getByTripId(tripId: string): Promise<ReservationModel[]> {
    const all = await staticDb.getAll('reservations');
    return all.filter((r) => r.tripId === tripId);
  },

  async getForDriverPending(driverId: string): Promise<ReservationModel[]> {
    const all = await staticDb.getAll('reservations');
    return all.filter((r) => r.driverId === driverId && r.status === 'pending');
  },

  // ─── Écriture ───────────────────────────────────────────────────────────────

  async create(reservation: ReservationModel): Promise<ReservationModel> {
    const trip = await TripService.getById(reservation.tripId);
    if (!trip) throw new Error(`Trajet ${reservation.tripId} introuvable`);
    if (!['published', 'full'].includes(trip.status)) {
      throw new Error('Ce trajet n\'accepte plus de nouvelles reservations');
    }
    if (trip.driverId === reservation.passengerId) {
      throw new Error('Le conducteur ne peut pas reserver son propre trajet');
    }
    if (trip.passengerIds.includes(reservation.passengerId)) {
      throw new Error('Le passager est deja confirme sur ce trajet');
    }
    if (trip.currentPassengers >= trip.maxPassengers) {
      throw new Error('Aucune place disponible');
    }

    const existingReservations = await ReservationService.getByTripId(reservation.tripId);
    const duplicateActiveReservation = existingReservations.find(
      (item) =>
        item.passengerId === reservation.passengerId &&
        ['pending', 'confirmed', 'in_progress'].includes(item.status)
    );
    if (duplicateActiveReservation) {
      throw new Error('Une reservation active existe deja pour ce passager sur ce trajet');
    }

    await staticDb.add('reservations', reservation);
    return reservation;
  },

  /** Met à jour le statut d'une réservation */
  async updateStatus(id: string, status: ReservationLifecycleStatus): Promise<void> {
    await staticDb.updateById('reservations', id, { status });
    staticDb.invalidate('reservations');
  },

  /**
   * Conducteur accepte une demande de réservation
   * - Passe la réservation à 'confirmed'
   * - Ajoute le passager au trajet
   */
  async accept(reservationId: string): Promise<void> {
    const reservation = await ReservationService.getById(reservationId);
    if (!reservation) throw new Error(`Réservation ${reservationId} introuvable`);
    if (reservation.status !== 'pending') {
      throw new Error('Seules les réservations en attente peuvent être acceptées');
    }

    const trip = await TripService.getById(reservation.tripId);
    if (!trip) throw new Error(`Trajet ${reservation.tripId} introuvable`);
    if (!['published', 'full'].includes(trip.status)) {
      throw new Error('Ce trajet ne peut plus confirmer de reservation');
    }
    if (trip.passengerIds.includes(reservation.passengerId)) {
      throw new Error('Ce passager est deja confirme sur le trajet');
    }
    if (trip.currentPassengers >= trip.maxPassengers) {
      throw new Error('Aucune place disponible');
    }

    const now = new Date().toISOString();
    await staticDb.updateById('reservations', reservationId, {
      status: 'confirmed',
      confirmedAt: now,
    });

    await TripService.addPassenger(reservation.tripId, reservation.passengerId);
    staticDb.invalidate('reservations');
    staticDb.invalidate('trips');
  },

  /**
   * Conducteur refuse une demande de réservation
   */
  async refuse(reservationId: string, reason?: string): Promise<void> {
    const reservation = await ReservationService.getById(reservationId);
    if (!reservation) throw new Error(`Réservation ${reservationId} introuvable`);
    if (reservation.status !== 'pending') {
      throw new Error('Seules les réservations en attente peuvent être refusées');
    }

    await staticDb.updateById('reservations', reservationId, {
      status: 'refused',
      refusalReason: reason ?? undefined,
    });
    staticDb.invalidate('reservations');
  },

  /**
   * Annulation d'une réservation (passager ou conducteur)
   * - Si confirmée, libère la place sur le trajet
   */
  async cancel(reservationId: string, reason?: string): Promise<void> {
    const reservation = await ReservationService.getById(reservationId);
    if (!reservation) throw new Error(`Réservation ${reservationId} introuvable`);

    const cancellable: ReservationLifecycleStatus[] = ['pending', 'confirmed'];
    if (!cancellable.includes(reservation.status)) {
      throw new Error('Cette réservation ne peut plus être annulée');
    }

    const now = new Date().toISOString();
    await staticDb.updateById('reservations', reservationId, {
      status: 'cancelled',
      cancelledAt: now,
      cancellationReason: reason ?? undefined,
    });

    if (reservation.status === 'confirmed') {
      await TripService.removePassenger(reservation.tripId, reservation.passengerId);
    }

    staticDb.invalidate('reservations');
    staticDb.invalidate('trips');
  },

  /**
   * Confirmation d'embarquement (conducteur)
   */
  async confirmBoardingByDriver(reservationId: string): Promise<void> {
    await staticDb.updateById('reservations', reservationId, {
      boardingConfirmedByDriver: true,
    });
    staticDb.invalidate('reservations');
  },

  /**
   * Confirmation d'embarquement (passager)
   */
  async confirmBoardingByPassenger(reservationId: string): Promise<void> {
    await staticDb.updateById('reservations', reservationId, {
      boardingConfirmedByPassenger: true,
    });
    staticDb.invalidate('reservations');
  },

  /**
   * Complète toutes les réservations actives d'un trajet
   */
  async completeAllForTrip(tripId: string): Promise<void> {
    const all = await staticDb.getAll('reservations');
    const now = new Date().toISOString();

    const updated = all.map((r) => {
      if (r.tripId === tripId && r.status === 'in_progress') {
        return { ...r, status: 'completed' as ReservationLifecycleStatus, completedAt: now };
      }
      return r;
    });

    await staticDb.saveAll('reservations', updated);
    staticDb.invalidate('reservations');
  },

  /** Génère un identifiant unique pour une nouvelle réservation */
  generateId(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `RSV-${year}-${rand}`;
  },
};
