import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { PublishedTripView } from '@/features/trajets/components/published-trip';
import {
  toPublishedTripViewData,
  toTrajetsReservationStatus,
} from '@/features/trajets/converters/trip.converter';
import { ViewerRole, TripViewSource } from '@/features/trajets/types/published-trip.view.types';
import { withAuth } from '@/server/auth';
import { TripService } from '@/server/services/TripService';
import { UserService } from '@/server/services/UserService';
import { VehicleService } from '@/server/services/VehicleService';
import { ReservationService } from '@/server/services/ReservationService';
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

  const auth = await withAuth();

  // Fetch trip depuis Server Core
  const tripResult = await TripService.getById(id, auth);
  if (!tripResult.success || !tripResult.data) {
    notFound();
  }
  const tripDto = tripResult.data;

  // Profil conducteur : inclus dans tripDto.Driver si disponible, sinon fetch public
  let driverDto: { id: string; firstName: string; lastName: string; avatarUrl?: string; goScore?: number; memberSince?: string; driverRating?: number } | null = null;
  if (tripDto.driver) {
    driverDto = {
      id: tripDto.driverId,
      firstName: tripDto.driver.firstName ?? '',
      lastName: tripDto.driver.lastName ?? '',
      avatarUrl: tripDto.driver.avatarUrl,
      goScore: tripDto.driver.goScore,
      driverRating: Number(tripDto.driver.averageRating ?? 4.5),
    };
  } else {
    const driverResult = await UserService.getPublicProfile(tripDto.driverId, auth);
    if (!driverResult.success || !driverResult.data) {
      notFound();
    }
    const pub = driverResult.data!;
    driverDto = {
      id: pub.id,
      firstName: pub.firstName,
      lastName: pub.lastName,
      avatarUrl: pub.avatarUrl,
      goScore: pub.goScore,
      memberSince: pub.memberSince,
    };
  }
  if (!driverDto) notFound();

  // Fetch vehicle depuis Server Core (fallback si non trouve)
  const vehicleResult = await VehicleService.getMyVehicles(auth);
  const vehicleDto = vehicleResult.success
    ? vehicleResult.data?.find((v) => v.id === tripDto.vehicleId)
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
    pricePerPassenger: Number(tripDto.pricePerPassenger),
    passengerPrice: Math.round(Number(tripDto.pricePerPassenger) * 1.15 * 100) / 100,
    paymentMethod: (tripDto.paymentMethod as TripModel['paymentMethod']) ?? 'cash',
    status: (tripDto.status as TripModel['status']) ?? 'published',
    departureType: 'planned',
    tripType: (tripDto.tripType as TripModel['tripType']) ?? 'unique',
    preferences: {
      conversationLevel: (tripDto.conversationLevel as 'quiet' | 'moderate' | 'chatty') ?? 'moderate',
      musicAllowed: tripDto.musicAllowed ?? true,
      smokingAllowed: tripDto.smokingAllowed ?? false,
      petsAllowed: tripDto.petsAllowed ?? false,
      baggageAllowed: tripDto.baggageAllowed ?? true,
      flexibleItinerary: false,
    },
    createdAt: tripDto.createdAt,
    updatedAt: tripDto.updatedAt,
  };

  // Mapper UserPublicDto → UserModel
  const driverUser: UserModel = {
    id: driverDto.id,
    email: '',
    firstName: driverDto.firstName ?? '',
    lastName: driverDto.lastName ?? '',
    initials: `${driverDto.firstName?.[0] ?? ''}${driverDto.lastName?.[0] ?? ''}`.toUpperCase(),
    avatarUrl: driverDto.avatarUrl,
    role: 'driver' as const,
    canBeDriver: true,
    profileVerified: false,
    isActive: true,
    passengerProfile: { averageRating: 4.0, totalTripsAsPassenger: 0, co2SavedKg: 0, punctualityScore: 80, noShowCount: 0 },
    preferences: { musicAccepted: true, petsAccepted: false, smokingAccepted: false, conversationLevel: 'moderate' as const },
    goScore: driverDto.goScore ?? 0,
    badgeIds: [],
    createdAt: driverDto.memberSince ?? '',
    updatedAt: driverDto.memberSince ?? '',
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
  let existingReservation: { status: import('@/features/trajets/types/published-trip.view.types').ReservationStatus; updatedAt: string } | undefined;

  const alreadyReservedBool =
    alreadyReserved === 'true' || alreadyReserved === '1' ? true
    : alreadyReserved === 'false' || alreadyReserved === '0' ? false
    : false;

  if (connectedUser?.id && connectedUser.id !== tripDto.driverId) {
    try {
      const resResult = await ReservationService.getMine(undefined, 1, 50, auth);
      if (resResult.success && resResult.data) {
        const match = (resResult.data.items ?? [])
          .filter((r) => r.tripId === tripDto.id && r.passengerId === connectedUser.id)
          .sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())[0];
        if (match) {
          existingReservation = {
            status: toTrajetsReservationStatus(match.status as import('@/core/models/ReservationModel').ReservationLifecycleStatus),
            updatedAt: match.updatedAt ?? match.createdAt,
          };
        }
      }
    } catch (err) {
      console.error('[trajets/[id]] fetch reservations', err);
    }
  }

  if (!existingReservation && alreadyReservedBool) {
    existingReservation = {
      status: 'pending',
      updatedAt: new Date().toISOString(),
    };
  }

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
  const auth = await withAuth();
  const tripResult = await TripService.getById(id, auth);
  const tripDto = tripResult.success ? tripResult.data : null;

  return {
    title: tripDto
      ? `${tripDto.departureAddress} vers ${tripDto.arrivalAddress} — La Cite Covoiturage`
      : 'Details du trajet — La Cite Covoiturage',
  };
}