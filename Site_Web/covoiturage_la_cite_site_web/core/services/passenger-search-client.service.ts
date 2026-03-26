import { Trip } from '@/features/dashboard/types/trip.types';
import {
  DEFAULT_SEARCH_FILTERS,
  MatchingScore,
  PassengerSortKey,
  SearchFilters,
  TripWithCoords,
} from '@/features/search/types/search.feature.types';

const EARTH_R = 6_371_000;

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toR = (d: number) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLng = toR(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(a));
}

function geoScore(distMeters: number, maxPts = 30): number {
  return Math.round(maxPts * Math.exp(-distMeters / 1000));
}

function horaireScore(tripTime: string, desiredHour?: number): number {
  if (desiredHour === undefined) return 10;
  const [h, m] = tripTime.split(':').map(Number);
  const diff = Math.abs(h + m / 60 - desiredHour);
  if (diff <= 0.5) return 20;
  if (diff <= 1.0) return 16;
  if (diff <= 2.0) return 10;
  if (diff <= 3.0) return 4;
  return 0;
}

export function computePassengerSearchResult(params: {
  trips: Trip[];
  departureCoords: [number, number] | null;
  arrivalCoords: [number, number] | null;
  filters?: Partial<SearchFilters>;
  sortKey?: PassengerSortKey;
  desiredHour?: number;
}): {
  filteredTrips: Trip[];
  scores: Map<string, MatchingScore>;
} {
  const {
    trips,
    departureCoords,
    arrivalCoords,
    filters = {},
    sortKey = 'matching_desc',
    desiredHour,
  } = params;

  const merged: SearchFilters = { ...DEFAULT_SEARCH_FILTERS, ...filters };
  const scores = new Map<string, MatchingScore>();

  for (const trip of trips) {
    const typedTrip = trip as TripWithCoords;
    let geoDepart = 15;
    let geoArrivee = 15;

    if (departureCoords && typedTrip.departureCoords) {
      const [pLng, pLat] = departureCoords;
      const [tLng, tLat] = typedTrip.departureCoords;
      geoDepart = geoScore(haversine(pLat, pLng, tLat, tLng), 30);
    }

    if (arrivalCoords && typedTrip.arrivalCoords) {
      const [pLng, pLat] = arrivalCoords;
      const [tLng, tLat] = typedTrip.arrivalCoords;
      geoArrivee = geoScore(haversine(pLat, pLng, tLat, tLng), 30);
    }

    const horaire = trip.time ? horaireScore(trip.time, desiredHour) : 10;
    const noteConducteur = Math.round((trip.driver.rating / 5.0) * 10);
    const availableSeats = trip.maxPassengers - trip.passengers.length;
    const places = availableSeats <= 0 ? 0 : availableSeats === 1 ? 4 : availableSeats === 2 ? 7 : 10;
    const total = Math.min(100, geoDepart + geoArrivee + horaire + noteConducteur + places);

    scores.set(trip.id, {
      total,
      geoDepart,
      geoArrivee,
      horaire,
      noteConducteur,
      places,
    });
  }

  const filteredTrips = [...trips].filter((trip) => {
    const typedTrip = trip as TripWithCoords;

    if (departureCoords && typedTrip.departureCoords) {
      const [pLng, pLat] = departureCoords;
      const [tLng, tLat] = typedTrip.departureCoords;
      if (haversine(pLat, pLng, tLat, tLng) > merged.departureRadiusMeters) return false;
    }

    if (arrivalCoords && typedTrip.arrivalCoords) {
      const [pLng, pLat] = arrivalCoords;
      const [tLng, tLat] = typedTrip.arrivalCoords;
      if (haversine(pLat, pLng, tLat, tLng) > merged.arrivalRadiusMeters) return false;
    }

    if (merged.maxPrice !== undefined && trip.price > merged.maxPrice) return false;
    if (merged.minSeatsAvailable !== undefined && trip.maxPassengers - trip.passengers.length < merged.minSeatsAvailable) return false;

    if (merged.driverName?.trim()) {
      const needle = merged.driverName.trim().toLowerCase();
      if (!trip.driver.name.toLowerCase().includes(needle)) return false;
    }

    if (merged.statuses?.length && typedTrip.status) {
      if (!merged.statuses.includes(typedTrip.status)) return false;
    }

    return true;
  });

  switch (sortKey) {
    case 'price_asc':
      filteredTrips.sort((left, right) => left.price - right.price);
      break;
    case 'price_desc':
      filteredTrips.sort((left, right) => right.price - left.price);
      break;
    case 'departure_asc':
      filteredTrips.sort((left, right) => {
        const leftDate = new Date(`${left.date}T${left.time || '00:00'}`).getTime();
        const rightDate = new Date(`${right.date}T${right.time || '00:00'}`).getTime();
        return leftDate - rightDate;
      });
      break;
    case 'seats_desc':
      filteredTrips.sort(
        (left, right) =>
          (right.maxPassengers - right.passengers.length) -
          (left.maxPassengers - left.passengers.length),
      );
      break;
    case 'matching_desc':
    default:
      filteredTrips.sort((left, right) => {
        const scoreDelta = (scores.get(right.id)?.total ?? 0) - (scores.get(left.id)?.total ?? 0);
        return scoreDelta !== 0 ? scoreDelta : left.price - right.price;
      });
      break;
  }

  return { filteredTrips, scores };
}
