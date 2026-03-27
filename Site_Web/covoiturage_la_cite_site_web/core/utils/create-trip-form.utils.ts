import type { TripModel } from '@/core/models/TripModel';
import { DEFAULT_TRIP_PREFERENCES } from '@/core/models/TripModel';

type DraftGeoShape = {
  departureCoords?: [number, number];
  arrivalCoords?: [number, number];
  polyline?: [number, number][];
};

type SelectedCircuitShape = {
  departureCoords?: [number, number];
  arrivalCoords?: [number, number];
  latLngs?: [number, number][];
  waypointCoords?: [number, number][];
};

export type TripWaypointPayload = {
  order: number;
  location: {
    label: string;
    fullAddress: string;
    coordinates: { lat: number; lng: number };
  };
};

export function hasGeoPoint(point: { lat: number; lng: number }) {
  return point.lat !== 0 || point.lng !== 0;
}

export function readTripGeoFromSession(storage: Storage | null) {
  let departureCoords = { lat: 0, lng: 0 };
  let arrivalCoords = { lat: 0, lng: 0 };
  let polyline: [number, number][] = [];
  let waypoints: TripWaypointPayload[] = [];

  if (!storage) {
    return { departureCoords, arrivalCoords, polyline, waypoints };
  }

  const selectedCircuitRaw = storage.getItem('selectedCircuit');
  if (selectedCircuitRaw) {
    try {
      const circuit = JSON.parse(selectedCircuitRaw) as SelectedCircuitShape;
      if (Array.isArray(circuit.departureCoords) && circuit.departureCoords.length === 2) {
        departureCoords = { lat: circuit.departureCoords[1], lng: circuit.departureCoords[0] };
      }
      if (Array.isArray(circuit.arrivalCoords) && circuit.arrivalCoords.length === 2) {
        arrivalCoords = { lat: circuit.arrivalCoords[1], lng: circuit.arrivalCoords[0] };
      }
      if (Array.isArray(circuit.latLngs) && circuit.latLngs.length >= 2) {
        polyline = circuit.latLngs;
      }
      if (Array.isArray(circuit.waypointCoords) && circuit.waypointCoords.length > 0) {
        waypoints = circuit.waypointCoords.map(([lng, lat], index) => ({
          order: index + 1,
          location: {
            label: `Waypoint ${index + 1}`,
            fullAddress: `Waypoint ${index + 1}`,
            coordinates: { lat, lng },
          },
        }));
      }
    } catch {
      // ignore invalid session payload
    }
  }

  const draftRaw = storage.getItem('quickPlanDraft');
  if (draftRaw) {
    try {
      const draft = JSON.parse(draftRaw) as DraftGeoShape;
      if (!hasGeoPoint(departureCoords) && Array.isArray(draft.departureCoords) && draft.departureCoords.length === 2) {
        departureCoords = { lat: draft.departureCoords[0], lng: draft.departureCoords[1] };
      }
      if (!hasGeoPoint(arrivalCoords) && Array.isArray(draft.arrivalCoords) && draft.arrivalCoords.length === 2) {
        arrivalCoords = { lat: draft.arrivalCoords[0], lng: draft.arrivalCoords[1] };
      }
      if (polyline.length === 0 && Array.isArray(draft.polyline)) {
        polyline = draft.polyline;
      }
    } catch {
      // ignore invalid draft
    }
  }

  return { departureCoords, arrivalCoords, polyline, waypoints };
}

export function buildTripPayload(params: {
  driverId: string;
  vehicleId: string;
  departureLocation: string;
  arrivalLocation: string;
  departureInstructions?: string;
  arrivalInstructions?: string;
  departureCoords: { lat: number; lng: number };
  arrivalCoords: { lat: number; lng: number };
  waypoints: TripWaypointPayload[];
  polyline: [number, number][];
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerPassenger: number;
  paymentMethod: TripModel['paymentMethod'];
  tripType: TripModel['tripType'];
  preferences: {
    baggageAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    musicAllowed: boolean;
    flexibleItinerary: boolean;
    driverNote?: string;
  };
  recurrenceDays?: number[];
  recurrenceEndDate?: string;
  estimatedDistance?: number;
  estimatedDuration?: number;
  notes?: string;
}): Omit<TripModel, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    driverId: params.driverId,
    vehicleId: params.vehicleId,
    departure: {
      label: params.departureLocation,
      fullAddress: params.departureLocation,
      coordinates: params.departureCoords,
      instructions: params.departureInstructions || undefined,
    },
    arrival: {
      label: params.arrivalLocation,
      fullAddress: params.arrivalLocation,
      coordinates: params.arrivalCoords,
      instructions: params.arrivalInstructions || undefined,
    },
    waypoints: params.waypoints,
    polyline: params.polyline,
    departureDate: params.departureDate,
    departureTime: params.departureTime,
    maxPassengers: params.availableSeats,
    currentPassengers: 0,
    passengerIds: [],
    pricePerPassenger: params.pricePerPassenger,
    paymentMethod: params.paymentMethod,
    status: 'published',
    departureType: 'planned',
    tripType: params.tripType,
    preferences: {
      ...DEFAULT_TRIP_PREFERENCES,
      baggageAllowed: params.preferences.baggageAllowed,
      petsAllowed: params.preferences.petsAllowed,
      smokingAllowed: params.preferences.smokingAllowed,
      musicAllowed: params.preferences.musicAllowed,
      flexibleItinerary: params.preferences.flexibleItinerary,
      driverNote: params.preferences.driverNote || undefined,
    },
    recurrenceDays: params.recurrenceDays,
    recurrenceEndDate: params.recurrenceEndDate,
    estimatedDistanceKm: params.estimatedDistance,
    estimatedDurationMinutes: params.estimatedDuration,
    notes: params.notes,
  };
}
