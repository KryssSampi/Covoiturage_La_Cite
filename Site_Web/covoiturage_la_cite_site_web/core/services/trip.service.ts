import { staticDb } from '@/tests/db/StaticDb';
import type { TripModel, TripLifecycleStatus } from '@/core/models/TripModel';

/**
 * TripService — Service de gestion des trajets
 * Interface entre les composants et la base de données JSON locale
 */
export const TripService = {
  // ─── Lecture ────────────────────────────────────────────────────────────────

  /** Récupère tous les trajets */
  async getAll(): Promise<TripModel[]> {
    return staticDb.getAll('trips');
  },

  /** Récupère un trajet par son id */
  async getById(id: string): Promise<TripModel | null> {
    return staticDb.getById('trips', id);
  },

  /** Récupère les trajets d'un conducteur */
  async getByDriverId(driverId: string): Promise<TripModel[]> {
    const trips = await staticDb.getAll('trips');
    return trips.filter((t) => t.driverId === driverId);
  },

  /** Récupère les trajets où un passager est inscrit */
  async getByPassengerId(passengerId: string): Promise<TripModel[]> {
    const trips = await staticDb.getAll('trips');
    return trips.filter((t) => t.passengerIds.includes(passengerId));
  },

  /**
   * Recherche les trajets publiés correspondant à des critères
   * - Trajets de statut 'published' uniquement
   * - Filtre par date si fournie
   */
  async search(params: {
    departureDate?: string;
    statuses?: TripLifecycleStatus[];
  }): Promise<TripModel[]> {
    const trips = await staticDb.getAll('trips');

    return trips.filter((t) => {
      const targetStatuses = params.statuses ?? ['published', 'full'];
      if (!targetStatuses.includes(t.status)) return false;
      if (params.departureDate && t.departureDate !== params.departureDate) return false;
      return true;
    });
  },

  // ─── Écriture ───────────────────────────────────────────────────────────────

  /** Crée un nouveau trajet */
  async create(trip: TripModel): Promise<TripModel> {
    await staticDb.add('trips', trip);
    return trip;
  },

  /** Met à jour un trajet */
  async update(id: string, patch: Partial<TripModel>): Promise<void> {
    await staticDb.updateById('trips', id, patch);
    staticDb.invalidate('trips');
  },

  /** Change le statut d'un trajet */
  async updateStatus(id: string, status: TripLifecycleStatus): Promise<void> {
    await TripService.update(id, { status });
  },

  /** Démarre un trajet (passe à 'in_progress') */
  async start(id: string): Promise<void> {
    await TripService.updateStatus(id, 'in_progress');
  },

  /** Complète un trajet */
  async complete(id: string): Promise<void> {
    await TripService.updateStatus(id, 'completed');
  },

  /** Annule un trajet */
  async cancel(id: string): Promise<void> {
    await TripService.updateStatus(id, 'cancelled');
  },

  /**
   * Ajoute un passager à un trajet (après confirmation de réservation)
   * Décrémente les places disponibles
   */
  async addPassenger(tripId: string, passengerId: string): Promise<void> {
    const trip = await TripService.getById(tripId);
    if (!trip) throw new Error(`Trajet ${tripId} introuvable`);
    if (trip.currentPassengers >= trip.maxPassengers) throw new Error('Aucune place disponible');

    const newPassengerIds = [...trip.passengerIds, passengerId];
    const newCurrentPassengers = trip.currentPassengers + 1;
    // Auto-full : si toutes les places sont prises, passer en "full"
    const newStatus = newCurrentPassengers >= trip.maxPassengers ? 'full' : trip.status;

    await TripService.update(tripId, {
      passengerIds: newPassengerIds,
      currentPassengers: newCurrentPassengers,
      status: newStatus,
    });
  },

  /**
   * Retire un passager d'un trajet (après annulation de réservation)
   * Incrémente les places disponibles
   */
  async removePassenger(tripId: string, passengerId: string): Promise<void> {
    const trip = await TripService.getById(tripId);
    if (!trip) throw new Error(`Trajet ${tripId} introuvable`);

    const newPassengerIds = trip.passengerIds.filter((id) => id !== passengerId);
    const newCurrentPassengers = Math.max(trip.currentPassengers - 1, 0);
    // Repasse à 'published' si était 'full'
    const newStatus = trip.status === 'full' ? 'published' : trip.status;

    await TripService.update(tripId, {
      passengerIds: newPassengerIds,
      currentPassengers: newCurrentPassengers,
      status: newStatus,
    });
  },

  /** Génère un identifiant unique pour un nouveau trajet */
  generateId(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `TRJ-${year}-${rand}`;
  },
};
