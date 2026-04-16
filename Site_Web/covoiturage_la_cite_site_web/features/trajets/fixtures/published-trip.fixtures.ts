import { PublishedTripViewData } from '../types/published-trip.view.types';

// ── Route Campus La Cité → Orléans (coordonnées réelles Ottawa) ──────────────
// Polyline approximative via les rues principales
const LACITE_ORLEANS_LATLNGS: [number, number][] = [
  [45.4189, -75.6753], // Campus La Cité
  [45.4210, -75.6630], // Pont Cummings
  [45.4290, -75.6400], // Boulevard St-Laurent
  [45.4370, -75.6100], // Chemin Innes
  [45.4440, -75.5750], // Carrefour Orléans
  [45.4530, -75.5480], // Boulevard Orléans
  [45.4560, -75.5090], // Place d'Orléans
];

export const MOCK_PUBLISHED_TRIP: PublishedTripViewData = {
  id: 'trip-001',
  driver: {
    id: 'driver-001',
    firstName: 'Julie Tremblay',
    avatarUrl: '/assets/placeholder/placeholer-profile-picture.png',
    rating: 4.5,
    tripCount: 40,
  },
  vehicle: {
    label: 'Honda Civic 2020',
    color: 'Noire',
    imageUrl: '/assets/vehicles/honda-civic-black.png',
  },
  departure: {
    label: 'Campus La Cité',
    fullAddress: '801 promenade de l\'Aviation, Ottawa, ON K1K 4R3',
    instructions: "Rendez-vous devant l'entrée principale, près du stationnement A.",
    // Coordonnées [lat, lng] du Campus La Cité
    lat: 45.4189,
    lng: -75.6753,
  },
  arrival: {
    label: 'Orléans',
    fullAddress: "Place d'Orléans, 110 Place d'Orléans Dr, Orléans, ON K1C 2L9",
    instructions: "Rendez-vous devant l'entrée principale de Place d'Orléans.",
    // Coordonnées [lat, lng] de Place d'Orléans
    lat: 45.4560,
    lng: -75.5090,
  },
  pricePerPassenger: 6,
  passengerPrice: 6.90,
  departureDate: "Aujourd'hui",
  departureTime: '03h30',
  estimatedDuration: 18,
  estimatedDistance: 16.8,
  availableSeats: 3,
  totalSeats: 4,
  preferences: {
    baggageAllowed: true,
    petsAllowed: true,
    smokingAllowed: false,
    musicAllowed: false,
    flexibleItinerary: true,
    driverNote: 'Départ devant la principale.',
  },
  status: {
    tripType: 'unique',
    isRecurrent: false,
    maxDetourMinutes: 10,
    lastUpdatedAt: new Date().toISOString(),
  },
  paymentMethod: 'cash',
  /** Polyline Campus La Cité → Place d'Orléans au format [lat, lng] */
  latLngs: LACITE_ORLEANS_LATLNGS,
};
