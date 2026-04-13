/**
 * POST /api/passenger/search
 * Delegue au Server Core - POST api/matching/search
 * Fallback sur GET api/trips/search si le matching echoue.
 */
import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import { get, post } from '@/server/http-client';

interface MatchedTripDto {
  tripId: string;
  driverId: string;
  driverFirstName: string;
  driverLastName?: string;
  driverAvatarUrl?: string;
  driverRating: number;
  driverTripCount?: number;
  driverVerified: boolean;
  departureLabel: string;
  departureLat?: number;
  departureLng?: number;
  arrivalLabel: string;
  arrivalLat?: number;
  arrivalLng?: number;
  polyline?: string;
  departureDate: string;
  departureTime: string;
  estimatedDurationMinutes: number;
  estimatedDistanceKm: number;
  pricePerPassenger?: number;
  passengerPrice: number;
  paymentMethod: string;
  maxPassengers?: number;
  availableSeats: number;
  score?: { total: number; eliminationReason?: string };
}

interface ServerMatchingResultDto {
  trips: MatchedTripDto[];
  totalEvaluated: number;
  totalEliminated: number;
  totalMatched: number;
}

interface SimpleTrajetDto {
  id: string;
  driverId: string;
  departureLabel?: string;
  departureAddress: string;
  departureLat: number;
  departureLng: number;
  arrivalLabel?: string;
  arrivalAddress: string;
  arrivalLat: number;
  arrivalLng: number;
  polyline?: string;
  departureDate: string;
  departureTime: string;
  estimatedDurationMinutes: number;
  estimatedDistanceKm?: number;
  maxPassengers: number;
  currentPassengers: number;
  pricePerPassenger: number;
  passengerPrice?: number;
  paymentMethod: string;
  status: string;
  driver?: { firstName?: string; lastName?: string; avatarUrl?: string; averageRating?: number; goScore?: number };
}

interface TripSearchDTO {
  id: string;
  departure: { label: string; fullAddress: string; coordinates: { lat: number; lng: number } };
  arrival: { label: string; fullAddress: string; coordinates: { lat: number; lng: number } };
  departureDate: string;
  departureTime: string;
  estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
  pricePerPassenger: number;
  passengerPrice: number;
  paymentMethod: string;
  maxPassengers: number;
  availableSeats: number;
  tripType: string;
  polyline: [number, number][];
  preferences: {
    baggageAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    musicAllowed: boolean;
    flexibleItinerary: boolean;
    conversationLevel: string;
  };
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    rating: number;
    tripCount: number;
    verified: boolean;
  };
  matchScore?: number;
  blockedReason?: string;
}

function parsePolyline(raw?: string): [number, number][] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p[0]?.[0]) ? (p[0] as [number, number][]) : (p as [number, number][]);
  } catch {
    return [];
  }
}

function matchedToDTO(dto: MatchedTripDto): TripSearchDTO {
  return {
    id: dto.tripId,
    departure: {
      label: dto.departureLabel || '',
      fullAddress: dto.departureLabel || '',
      coordinates: { lat: dto.departureLat ?? 0, lng: dto.departureLng ?? 0 },
    },
    arrival: {
      label: dto.arrivalLabel || '',
      fullAddress: dto.arrivalLabel || '',
      coordinates: { lat: dto.arrivalLat ?? 0, lng: dto.arrivalLng ?? 0 },
    },
    departureDate: String(dto.departureDate ?? ''),
    departureTime: String(dto.departureTime ?? ''),
    estimatedDistanceKm: dto.estimatedDistanceKm,
    estimatedDurationMinutes: dto.estimatedDurationMinutes,
    pricePerPassenger: Number(dto.pricePerPassenger ?? dto.passengerPrice ?? 0),
    passengerPrice: Number(dto.passengerPrice ?? 0),
    paymentMethod: dto.paymentMethod || 'cash',
    maxPassengers: dto.maxPassengers ?? 4,
    availableSeats: dto.availableSeats,
    tripType: 'unique',
    polyline: parsePolyline(dto.polyline),
    preferences: {
      baggageAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      musicAllowed: true,
      flexibleItinerary: false,
      conversationLevel: 'moderate',
    },
    driver: {
      id: dto.driverId,
      firstName: dto.driverFirstName || '',
      lastName: dto.driverLastName || '',
      avatarUrl: dto.driverAvatarUrl,
      rating: Number(dto.driverRating ?? 4.5),
      tripCount: dto.driverTripCount ?? 0,
      verified: dto.driverVerified ?? false,
    },
    matchScore: dto.score?.total,
    blockedReason: dto.score?.eliminationReason,
  };
}

function simpleToDTO(dto: SimpleTrajetDto): TripSearchDTO {
  const price = Number(dto.pricePerPassenger ?? 0);
  return {
    id: dto.id,
    departure: {
      label: dto.departureLabel || dto.departureAddress || '',
      fullAddress: dto.departureAddress || '',
      coordinates: { lat: dto.departureLat, lng: dto.departureLng },
    },
    arrival: {
      label: dto.arrivalLabel || dto.arrivalAddress || '',
      fullAddress: dto.arrivalAddress || '',
      coordinates: { lat: dto.arrivalLat, lng: dto.arrivalLng },
    },
    departureDate: String(dto.departureDate ?? ''),
    departureTime: String(dto.departureTime ?? ''),
    estimatedDistanceKm: dto.estimatedDistanceKm,
    estimatedDurationMinutes: dto.estimatedDurationMinutes,
    pricePerPassenger: price,
    passengerPrice: Number(dto.passengerPrice ?? Math.round(price * 1.15 * 100) / 100),
    paymentMethod: dto.paymentMethod || 'cash',
    maxPassengers: dto.maxPassengers,
    availableSeats: dto.maxPassengers - (dto.currentPassengers ?? 0),
    tripType: 'unique',
    polyline: parsePolyline(dto.polyline),
    preferences: {
      baggageAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      musicAllowed: true,
      flexibleItinerary: false,
      conversationLevel: 'moderate',
    },
    driver: {
      id: dto.driverId,
      firstName: dto.driver?.firstName || '',
      lastName: dto.driver?.lastName || '',
      avatarUrl: dto.driver?.avatarUrl,
      rating: Number(dto.driver?.averageRating ?? 4.5),
      tripCount: 0,
      verified: false,
    },
  };
}

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);
    const body = (await req.json()) as {
      passengerId?: string;
      departureCoords?: [number, number];
      arrivalCoords?: [number, number];
      desiredHour?: number;
      desiredWeekday?: number;
      date?: string;
      maxPrice?: number;
      minSeatsAvailable?: number;
      departureRadiusMeters?: number;
      arrivalRadiusMeters?: number;
      sortKey?: string;
    };

    const matchBody = {
      PassengerId: body.passengerId ?? "",
      DepartureLat: body.departureCoords?.[0] ?? 0,
      DepartureLng: body.departureCoords?.[1] ?? 0,
      ArrivalLat: body.arrivalCoords?.[0] ?? 0,
      ArrivalLng: body.arrivalCoords?.[1] ?? 0,
      DesiredDate: body.date,
      Date: body.date,
      DesiredHour: body.desiredHour,
      DesiredWeekday: body.desiredWeekday,
      MaxPrice: body.maxPrice,
      MinSeatsAvailable: body.minSeatsAvailable ?? 1,
      DepartureRadiusMeters: body.departureRadiusMeters ?? 5000,
      ArrivalRadiusMeters: body.arrivalRadiusMeters ?? 5000,
      SortKey: body.sortKey ?? 'score_desc',
    };

    const matchResult = await post<ServerMatchingResultDto>('api/matching/search', matchBody, auth);
    // Diagnostic log: help to identify why matching returns empty
    try {
      const tripsLen = (matchResult && (matchResult as unknown as ServerMatchingResultDto).trips)
        ? (matchResult as unknown as ServerMatchingResultDto).trips.length
        : 0;
      const mrMsg = (matchResult as unknown as { message?: string })?.message ?? null;
      console.log('[search] matching result:', Boolean((matchResult as unknown as { success?: boolean })?.success), tripsLen, mrMsg);
    } catch (e) {
      console.warn('[search] failed to log matching result', e);
    }
    if (matchResult.success && matchResult.data?.trips) {
      const mapped = matchResult.data.trips.map(matchedToDTO);
      const trips = mapped.filter((t) => !t.blockedReason);
      const matchedIds = new Set(matchResult.data.trips.map((t) => t.tripId));

      let blockedTrips: TripSearchDTO[] = [];
      try {
        const allPublished = await get<{ items?: SimpleTrajetDto[] } | SimpleTrajetDto[]>(
          'api/trips/search',
          { ...auth, params: { page: 1, pageSize: 50 } }
        );

        let items: SimpleTrajetDto[] = [];
        if (allPublished.success && allPublished.data) {
          const data = allPublished.data as unknown;
          if (Array.isArray(data)) items = data as SimpleTrajetDto[];
          else if (Array.isArray((data as { items?: unknown }).items)) {
            items = (data as { items: SimpleTrajetDto[] }).items;
          }
        }

        // Diagnostic: log items count returned by trips search
        try {
          console.log('[search] GET api/trips/search returned items:', Array.isArray(items) ? items.length : 0);
        } catch (e) {
          console.warn('[search] failed to log trips.search items', e);
        }

        blockedTrips = items
          .filter((t) => {
            const status = (t.status ?? '').toLowerCase();
            return status === 'published' && !matchedIds.has(t.id);
          })
          .slice(0, 10)
          .map((t) => ({
            ...simpleToDTO(t),
            matchScore: 0,
            blockedReason: 'low_match',
          }));
      } catch (e) {
        console.error('[search] GET api/trips/search failed:', e);
        blockedTrips = [];
      }

      const serverScores: Record<string, number> = {};
      for (const t of matchResult.data.trips) {
        if (t.tripId && t.score?.total != null) serverScores[t.tripId] = t.score.total;
      }

      return NextResponse.json({ trips, blockedTrips, serverScores });
    }

    const fallback = await get<{ items?: SimpleTrajetDto[] } | SimpleTrajetDto[]>(
      'api/trips/search',
      { ...auth, params: { page: 1, pageSize: 100 } }
    );

    let items: SimpleTrajetDto[] = [];
    if (fallback.success && fallback.data) {
      const d = fallback.data as unknown;
      if (Array.isArray(d)) items = d as SimpleTrajetDto[];
      else if (Array.isArray((d as { items?: unknown }).items)) items = (d as { items: SimpleTrajetDto[] }).items;
    }

    try {
      console.log('[search] fallback GET api/trips/search returned items:', Array.isArray(items) ? items.length : 0);
    } catch (e) {
      console.warn('[search] failed to log fallback trips.search items', e);
    }

    const published = items.filter((t) => {
      const s = (t.status ?? '').toLowerCase();
      return s === 'published' || s === 'full';
    });

    return NextResponse.json({ trips: published.map(simpleToDTO), blockedTrips: [] });
  } catch (err) {
    console.error('[/api/passenger/search]', err);
    return NextResponse.json({ trips: [], blockedTrips: [] });
  }
}
