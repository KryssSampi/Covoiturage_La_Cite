/**
 * @file drafts.fixtures.ts
 * @description 3 brouillons de trajets fictifs pour le développement.
 */

import type { DraftTrip } from "@/features/brouillons/types";

export const FIXTURE_DRAFTS: DraftTrip[] = [
  {
    id: "draft-1",
    departureLocation: "La Cité collégiale, Ottawa",
    arrivalLocation: "Place d'Orléans, Ottawa",
    departureDate: "2026-03-18",
    departureTime: "08:30",
    vehicleId: "v1",
    totalSeats: 4,
    availableSeats: 3,
    pricePerPassenger: 5,
    paymentMethod: "interac",
    preferences: {
      baggageAllowed: true,
      petsAllowed: false,
      smokingAllowed: false,
      musicAllowed: true,
      flexibleItinerary: false,
    },
    notes: "Départ côté entrée principale",
    createdAt: "2026-03-10T14:22:00Z",
    updatedAt: "2026-03-10T14:22:00Z",
  },
  {
    id: "draft-2",
    departureLocation: "Rideau Centre, Ottawa",
    arrivalLocation: "",
    departureDate: "2026-03-20",
    departureTime: "",
    vehicleId: "",
    totalSeats: 4,
    availableSeats: 2,
    pricePerPassenger: 7,
    paymentMethod: "cash",
    preferences: {
      baggageAllowed: false,
      petsAllowed: false,
      smokingAllowed: false,
      musicAllowed: false,
      flexibleItinerary: false,
    },
    createdAt: "2026-03-11T09:05:00Z",
    updatedAt: "2026-03-12T16:30:00Z",
  },
  {
    id: "draft-3",
    departureLocation: "",
    arrivalLocation: "Universit\u00e9 d\u2019Ottawa",
    departureDate: "",
    departureTime: "17:00",
    vehicleId: "v2",
    totalSeats: 5,
    availableSeats: 4,
    pricePerPassenger: 4,
    paymentMethod: "interac",
    preferences: {
      baggageAllowed: true,
      petsAllowed: true,
      smokingAllowed: false,
      musicAllowed: true,
      flexibleItinerary: true,
    },
    notes: "Trajet retour flex — heure approximative",
    createdAt: "2026-03-12T20:10:00Z",
    updatedAt: "2026-03-12T20:10:00Z",
  },
];
