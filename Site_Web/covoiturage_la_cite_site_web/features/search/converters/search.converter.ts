import type { TripModel } from '@/core/models/TripModel';
import type { UserModel } from '@/core/models/UserModel';
import type { TripWithCoords } from '../types/search.feature.types';

/**
 * Convertisseurs search
 * Transforment un TripModel en types attendus par les hooks de recherche
 */

/** Convertit un TripModel en TripWithCoords (format utilisé par usePassengerSearch) */
export function tripModelToTripWithCoords(
  trip: TripModel,
  driver: UserModel,
  passengers: UserModel[]
): TripWithCoords {
  const driverInfo = {
    id: driver.id,
    pictureUrl: driver.avatarUrl ?? '',
    name: `${driver.firstName} ${driver.lastName}`,
    rating: driver.driverProfile?.averageRating ?? 4.5,
    tripsCount: driver.driverProfile?.totalTripsAsDriver ?? 0,
  };

  return {
    id: trip.id,
    departure: trip.departure.label,
    destination: trip.arrival.label,
    date: trip.departureDate,
    time: trip.departureTime,
    price: trip.pricePerPassenger,
    maxPassengers: trip.maxPassengers,
    passengers: passengers.map((p) => ({
      id: p.id,
      pictureUrl: p.avatarUrl ?? '',
      name: `${p.firstName} ${p.lastName}`,
      rating: p.passengerProfile.averageRating,
      tripsCount: p.passengerProfile.totalTripsAsPassenger,
    })),
    driver: driverInfo,
    doneDate: trip.status === 'completed' ? new Date().toISOString() : null,
    departureCoords: [trip.departure.coordinates.lng, trip.departure.coordinates.lat],
    arrivalCoords: [trip.arrival.coordinates.lng, trip.arrival.coordinates.lat],
    latLngs: trip.polyline.length > 0 ? trip.polyline : undefined,
    status: trip.status,
  };
}

/** Convertit un tableau de TripModel en TripWithCoords[] */
export function tripsToTripWithCoords(
  trips: TripModel[],
  usersMap: Map<string, UserModel>
): TripWithCoords[] {
  return trips
    .filter((trip) => ['published', 'full'].includes(trip.status))
    .map((trip) => {
      const driver = usersMap.get(trip.driverId);
      if (!driver) return null;

      const passengers = trip.passengerIds
        .map((id) => usersMap.get(id))
        .filter((u): u is UserModel => u !== undefined);

      return tripModelToTripWithCoords(trip, driver, passengers);
    })
    .filter((t): t is TripWithCoords => t !== null);
}
