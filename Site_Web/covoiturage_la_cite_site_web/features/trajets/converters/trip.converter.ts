import type { TripModel } from '@/core/models/TripModel';
import type { UserModel } from '@/core/models/UserModel';
import type { VehicleModel } from '@/core/models/VehicleModel';
import type { ReservationModel } from '@/core/models/ReservationModel';
import type {
  PublishedTripViewData,
  TripDriver,
  TripVehicle,
  TripPoint,
  TripPreferencesView,
  TripStatusInfo,
  ReservationStatus as TrajetsReservationStatus,
} from '../types/published-trip.view.types';

/**
 * Convertisseurs trajets
 * Transforment un TripModel (+ entités liées) en types UI de la feature trajets
 */

/** Convertit un UserModel en TripDriver (vue conducteur sur un trajet) */
export function toTripDriver(user: UserModel): TripDriver {
  return {
    id: user.id,
    firstName: user.firstName,
    avatarUrl: user.avatarUrl ?? undefined,
    rating: user.driverProfile?.averageRating ?? 4.5,
    tripCount: user.driverProfile?.totalTripsAsDriver ?? 0,
  };
}

/** Convertit un VehicleModel en TripVehicle */
export function toTripVehicle(vehicle: VehicleModel): TripVehicle {
  return {
    label: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
    color: vehicle.color,
    imageUrl: vehicle.photoUrl ?? undefined,
  };
}

/** Convertit un point de départ/arrivée d'un TripModel en TripPoint */
export function toTripPoint(location: TripModel['departure']): TripPoint {
  return {
    label: location.label,
    fullAddress: location.fullAddress,
    instructions: location.instructions ?? undefined,
    lat: location.coordinates.lat,
    lng: location.coordinates.lng,
  };
}

/** Convertit un TripModel en TripPreferencesView */
export function toTripPreferencesView(trip: TripModel): TripPreferencesView {
  return {
    baggageAllowed: trip.preferences.baggageAllowed,
    petsAllowed: trip.preferences.petsAllowed,
    smokingAllowed: trip.preferences.smokingAllowed,
    musicAllowed: trip.preferences.musicAllowed,
    flexibleItinerary: trip.preferences.flexibleItinerary,
    driverNote: trip.preferences.driverNote ?? undefined,
  };
}

/** Convertit un TripModel en TripStatusInfo */
export function toTripStatusInfo(trip: TripModel): TripStatusInfo {
  return {
    tripType: trip.tripType,
    isRecurrent: trip.tripType === 'recurrent',
    maxDetourMinutes: undefined,
    lastUpdatedAt: trip.updatedAt,
  };
}

/** Convertit un statut de réservation côté DB en statut UI trajets */
export function toTrajetsReservationStatus(
  status: ReservationModel['status'] | null
): TrajetsReservationStatus {
  const map: Record<string, TrajetsReservationStatus> = {
    pending: 'pending',
    confirmed: 'confirmed',
    refused: 'refused',
    cancelled: 'cancelled',
    in_progress: 'confirmed',
    completed: 'confirmed',
    no_show: 'cancelled',
  };
  return status ? (map[status] ?? 'none') : 'none';
}

/**
 * Convertit un TripModel + entités liées en PublishedTripViewData
 * (format attendu par le composant PublishedTripView)
 */
export function toPublishedTripViewData(
  trip: TripModel,
  driver: UserModel,
  vehicle: VehicleModel
): PublishedTripViewData {
  return {
    id: trip.id,
    driver: toTripDriver(driver),
    vehicle: toTripVehicle(vehicle),
    departure: toTripPoint(trip.departure),
    arrival: toTripPoint(trip.arrival),
    pricePerPassenger: trip.pricePerPassenger,
    departureDate: trip.departureDate,
    departureTime: trip.departureTime,
    estimatedDuration: trip.estimatedDurationMinutes ?? 0,
    estimatedDistance: trip.estimatedDistanceKm ?? 0,
    availableSeats: trip.maxPassengers - trip.currentPassengers,
    totalSeats: trip.maxPassengers,
    preferences: toTripPreferencesView(trip),
    status: trip.status as unknown as PublishedTripViewData['status'],
    paymentMethod: trip.paymentMethod,
    latLngs: trip.polyline.length > 0 ? trip.polyline : undefined,
  };
}
