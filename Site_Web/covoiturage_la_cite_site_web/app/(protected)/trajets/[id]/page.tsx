import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { PublishedTripView } from '@/features/trajets/components/published-trip';
import {
  toPublishedTripViewData,
  toTrajetsReservationStatus,
} from '@/features/trajets/converters/trip.converter';
import { ViewerRole, TripViewSource } from '@/features/trajets/types/published-trip.view.types';
import { persistenceManager } from '@/tests/PersistenceManager';
import type { ReservationModel } from '@/core/models/ReservationModel';
import type { TripModel } from '@/core/models/TripModel';
import type { ConnectedUser } from '@/core/state/app_state';
import type { UserModel } from '@/core/models/UserModel';
import type { VehicleModel } from '@/core/models/VehicleModel';

/**
 * Route : /trajets/[id]
 *
 * Acces autorise :
 *   Passager           : bouton Reserver (module selon etat de reservation)
 *   Conducteur auteur  : bouton Gerer les demandes
 *   Admin              : lecture seule
 *
 * Parametres URL optionnels :
 *   ?source=reservation|publishedtrip  — d'ou vient la navigation
 *   &status=confirmed|pending|...      — statut de la carte source
 *
 * Header & Footer herites de app/(protected)/layout.tsx
 */

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string; status?: string }>;
}

async function getConnectedUserFromCookie() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('userConnected')?.value;
  if (!raw) return null;

  try {
    return JSON.parse(decodeURIComponent(raw)) as Pick<ConnectedUser, 'id' | 'role'>;
  } catch {
    return null;
  }
}

export default async function TripViewPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { source: rawSource, status } = await searchParams;

  const trip = persistenceManager.readById<TripModel>('trips', id);
  if (!trip) {
    notFound();
  }

  const driver = persistenceManager.readById<UserModel>('users', trip.driverId);
  if (!driver) {
    notFound();
  }

  const vehicle =
    persistenceManager.readById<VehicleModel>('vehicles', trip.vehicleId) ??
    {
      id: trip.vehicleId,
      driverId: trip.driverId,
      make: 'Vehicule',
      model: 'non renseigne',
      year: new Date(trip.createdAt).getFullYear(),
      color: 'Inconnue',
      licensePlate: '',
      maxSeats: trip.maxPassengers + 1,
      isActive: true,
      isValidated: true,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    };

  const tripView = toPublishedTripViewData(trip, driver, vehicle);
  const connectedUser = await getConnectedUserFromCookie();

  const viewerRole: ViewerRole =
    connectedUser?.role === 'admin'
      ? 'admin'
      : connectedUser?.id === trip.driverId
        ? 'driver_owner'
        : 'passenger';

  const existingReservationModel =
    connectedUser?.id && connectedUser.id !== trip.driverId
      ? persistenceManager
          .readAll<ReservationModel>('reservations')
          .filter((reservation) => reservation.tripId === trip.id && reservation.passengerId === connectedUser.id)
          .sort(
            (a, b) =>
              new Date(b.updatedAt ?? b.createdAt).getTime() -
              new Date(a.updatedAt ?? a.createdAt).getTime()
          )[0]
      : undefined;

  const existingReservation = existingReservationModel
    ? {
        status: toTrajetsReservationStatus(existingReservationModel.status),
        updatedAt: existingReservationModel.updatedAt ?? existingReservationModel.createdAt,
      }
    : undefined;

  const source: TripViewSource =
    rawSource === 'reservation' || rawSource === 'publishedtrip' ? rawSource : null;

  return (
    <PublishedTripView
      trip={tripView}
      viewerRole={viewerRole}
      existingReservation={existingReservation}
      source={source}
      sourceStatus={status}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const trip = persistenceManager.readById<TripModel>('trips', id);

  return {
    title: trip
      ? `${trip.departure.label} vers ${trip.arrival.label} — La Cite Covoiturage`
      : 'Details du trajet — La Cite Covoiturage',
  };
}
