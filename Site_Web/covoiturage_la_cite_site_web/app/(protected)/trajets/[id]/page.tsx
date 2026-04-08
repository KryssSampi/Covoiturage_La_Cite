import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { PublishedTripView } from '@/features/trajets/components/published-trip';
import {
  toPublishedTripViewData,
  toTrajetsReservationStatus,
} from '@/features/trajets/converters/trip.converter';
import { ViewerRole, TripViewSource } from '@/features/trajets/types/published-trip.view.types';
import { TripService } from '@/server/services/TripService';
import { UserService } from '@/server/services/UserService';
import { VehicleService } from '@/server/services/VehicleService';
import { ReservationService } from '@/server/services/ReservationService';
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
  searchParams: Promise<{ source?: string; status?: string; role?: string; alreadyReserved?: string }>;
}

async function getConnectedUserFromCookie() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('userConnected')?.value;
  if (!raw) return null;

  try {
    return JSON.parse(decodeURIComponent(raw)) as Pick<ConnectedUser, 'id' | 'role'>;
  } catch (err) {
    console.error("[trajets/[id]/page]", err);
    return null;
  }
}

export default async function TripViewPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { source: rawSource, status, role: rawRole, alreadyReserved } = await searchParams;

  // Fetch trip depuis Server Core
  const tripResult = await TripService.getById(id);
  if (!tripResult.success || !tripResult.data) {
    notFound();
  }
  const tripDto = tripResult.data;

  // Fetch driver depuis Server Core
  const driverResult = await UserService.getById(tripDto.driverId);
  if (!driverResult.success || !driverResult.data) {
    notFound();
  }
  const driverDto = driverResult.data;

  // Fetch vehicle depuis Server Core (fallback si non trouve)
  const vehicleResult = await VehicleService.getMyVehicles();
  const vehicleDto = vehicleResult.success
    ? vehicleResult.data.find((v) => v.id === tripDto.vehicleId)
    : undefined;

  // Mapper TripDto → TripModel pour le converter existant
  const tripModel: TripModel = {
    id: tripDto.id,
    driverId: tripDto.driverId,
    vehicleId: tripDto.vehicleId,
    passengerIds: [],
    departure: {
      label: tripDto.departureAddress,
      fullAddress: tripDto.departureAddress,
      coordinates: { lat: tripDto.departureLat, lng: tripDto.departureLng },
    },
    arrival: {
      label: tripDto.arrivalAddress,
      fullAddress: tripDto.arrivalAddress,
      coordinates: { lat: tripDto.arrivalLat, lng: tripDto.arrivalLng },
    },
    waypoints: [],
    polyline: tripDto.polyline ? JSON.parse(tripDto.polyline) as [number, number][] : [],
    departureDate: tripDto.departureDate,
    departureTime: tripDto.departureTime,
    maxPassengers: tripDto.maxPassengers,
    currentPassengers: tripDto.currentPassengers,
    pricePerPassenger: tripDto.pricePerPassenger,
    passengerPrice: tripDto.passengerPrice,
    paymentMethod: (tripDto.paymentMethod as TripModel['paymentMethod']) ?? 'cash',
    status: (tripDto.status as TripModel['status']) ?? 'published',
    departureType: 'planned',
    tripType: (tripDto.tripType as TripModel['tripType']) ?? 'unique',
    preferences: {
      conversationLevel: (tripDto.conversationLevel as 'quiet' | 'moderate' | 'chatty') ?? 'moderate',
      musicAccepted: true,
      smokingAccepted: false,
      petsAccepted: false,
    },
    createdAt: tripDto.createdAt,
    updatedAt: tripDto.updatedAt,
  };

  // Mapper UserDto → UserModel
  const driverUser: UserModel = {
    id: driverDto.id,
    email: driverDto.email ?? '',
    firstName: driverDto.firstName ?? '',
    lastName: driverDto.lastName ?? '',
    initials: driverDto.initials ?? '',
    avatarUrl: driverDto.avatarUrl,
    role: 'driver' as const,
    canBeDriver: true,
    profileVerified: false,
    isActive: true,
    passengerProfile: { averageRating: 4.0, totalTripsAsPassenger: 0, co2SavedKg: 0, punctualityScore: 80, noShowCount: 0 },
    preferences: { musicAccepted: true, petsAccepted: false, smokingAccepted: false, conversationLevel: 'moderate' as const },
    goScore: 250,
    badgeIds: [],
    createdAt: driverDto.createdAt ?? '',
    updatedAt: driverDto.updatedAt ?? '',
  };

  // Mapper VehicleDto → VehicleModel
  const vehicleModel: VehicleModel = vehicleDto
    ? {
        id: vehicleDto.id,
        driverId: vehicleDto.driverProfileId,
        make: vehicleDto.make,
        model: vehicleDto.model,
        year: vehicleDto.year,
        color: vehicleDto.color,
        licensePlate: vehicleDto.licensePlate,
        maxSeats: vehicleDto.maxSeats,
        isActive: vehicleDto.isActive,
        isValidated: true,
        createdAt: vehicleDto.createdAt,
        updatedAt: vehicleDto.updatedAt,
      }
    : {
        id: tripDto.vehicleId,
        driverId: tripDto.driverId,
        make: 'Vehicule',
        model: 'non renseigne',
        year: new Date(tripDto.createdAt).getFullYear(),
        color: 'Inconnue',
        licensePlate: '',
        maxSeats: tripDto.maxPassengers + 1,
        isActive: true,
        isValidated: true,
        createdAt: tripDto.createdAt,
        updatedAt: tripDto.updatedAt,
      };

  const tripView = toPublishedTripViewData(tripModel, driverUser, vehicleModel);
  const connectedUser = await getConnectedUserFromCookie();

  const roleFromParam: ViewerRole | null =
    rawRole === 'admin' || rawRole === 'driver_owner' || rawRole === 'passenger'
      ? rawRole
      : null;

  const viewerRole: ViewerRole =
    roleFromParam ??
    (connectedUser?.role === 'admin'
      ? 'admin'
      : connectedUser?.id === tripDto.driverId
        ? 'driver_owner'
        : 'passenger');

  // Fetch reservation existante via Server Core
  let existingReservationModel: ReservationModel | undefined;
  if (connectedUser?.id && connectedUser.id !== tripDto.driverId) {
    try {
      const resResult = await ReservationService.getMine();
      if (resResult.success && resResult.data) {
        const matchingReservations = resResult.data
          .filter((r) => r.tripId === tripDto.id && r.passengerId === connectedUser.id)
          .sort(
            (a, b) =>
              new Date(b.updatedAt ?? b.createdAt).getTime() -
              new Date(a.updatedAt ?? a.createdAt).getTime()
          );
        if (matchingReservations.length > 0) {
          const r = matchingReservations[0];
          existingReservationModel = {
            id: r.id,
            tripId: r.tripId,
            passengerId: r.passengerId,
            driverId: r.driverId,
            status: r.status as ReservationModel['status'],
            paymentStatus: r.paymentStatus as ReservationModel['paymentStatus'],
            seatsReserved: r.seatsReserved,
            passengerPrice: r.passengerPrice,
            driverAmount: r.driverAmount,
            platformFee: r.platformFee,
            pickupNote: r.pickupNote,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            confirmedAt: r.confirmedAt,
            cancelledAt: r.cancelledAt,
          };
        }
      }
    } catch (err) {
      console.error('[trajets/[id]] fetch reservations', err);
    }
  }

  const alreadyReservedBool =
    alreadyReserved === 'true' || alreadyReserved === '1' ? true
    : alreadyReserved === 'false' || alreadyReserved === '0' ? false
    : false;

  const existingReservation = existingReservationModel
    ? {
        status: toTrajetsReservationStatus(existingReservationModel.status),
        updatedAt: existingReservationModel.updatedAt ?? existingReservationModel.createdAt,
      }
    : alreadyReservedBool
      ? {
          status: 'pending' as import('@/features/trajets/types/published-trip.view.types').ReservationStatus,
          updatedAt: new Date().toISOString(),
        }
      : undefined;

  const source: TripViewSource =
    rawSource === 'reservation' || rawSource === 'publishedtrip'
      ? rawSource
      : alreadyReservedBool
        ? 'reservation'
        : null;

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
  const tripResult = await TripService.getById(id);
  const tripDto = tripResult.success ? tripResult.data : null;

  return {
    title: tripDto
      ? `${tripDto.departureAddress} vers ${tripDto.arrivalAddress} — La Cite Covoiturage`
      : 'Details du trajet — La Cite Covoiturage',
  };
}