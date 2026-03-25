/**
 * @file reservations.fixtures.ts
 * @description DonnÃ©es de test pour ReservationRequestsSection (conducteur).
 * âš ï¸ DÃ‰VELOPPEMENT UNIQUEMENT â€” Ã€ remplacer par un appel API.
 *
 * TODO: GET /api/driver/{userId}/reservation-requests?status=pending
 *   Retourne les demandes triÃ©es par note desc â†’ date asc (voir OrganizeRequests)
 */

import { Reservation, ReservationStatus } from "@/features/dashboard/types";  

const PLACEHOLDER = "/assets/placeholder/placeholer-profile-picture.png";

// GÃ©nÃ¨re une date/heure dans 15 min â€” la rÃ©servation sera toujours imminente
function dans15min() {
  const d = new Date(Date.now() + 15 * 60_000);
  // Formatage local (évite le décalage UTC qui retourne la date de demain après 20h EDT)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return {
    date: `${year}-${month}-${day}`,
    time: d.toTimeString().slice(0, 5),
  };
}
const IMMINENT = dans15min();

export const FIXTURES_RESERVATIONS: Reservation[] = [
  {
    id: "1",
    tripId: "3",
    departure: "Ottawa", destination: "Montreal",
    date: "2026-02-23", time: "14:00",
    maxPassengers: 3, doneDate: null, duration: null,
    status: ReservationStatus.Confirmed,
    driver:     { id: "1", pictureUrl: PLACEHOLDER, name: "Charlie Durand",    rating: 4.8, tripsCount: 20 },
    passengers: [
      { id: "1", pictureUrl: PLACEHOLDER, name: "Alice Dupont",   rating: 4.5, tripsCount: 10 },
      { id: "2", pictureUrl: PLACEHOLDER, name: "Bob Martin",     rating: 4.0, tripsCount: 8  },
      { id: "3", pictureUrl: PLACEHOLDER, name: "Charlie Durand", rating: 4.8, tripsCount: 15 },
    ],
  },
  {
    id: "2",
    tripId: "7",
    departure: "Campus La Cité", destination: "Gatineau",
    date: new Date().toISOString(), time: "09:00",
    maxPassengers: 2, doneDate: null, duration: null,
    status: ReservationStatus.InProgress,
    driver:     { id: "2", pictureUrl: PLACEHOLDER, name: "Eve Smith",        rating: 4.6, tripsCount: 15 },
    passengers: [{ id: "3", pictureUrl: PLACEHOLDER, name: "David Lee",       rating: 4.2, tripsCount: 5  }],
  },
  {
    id: "3",
    tripId: "3",
    departure: "Orléans", destination: "Rideau",
    date: "2026-02-25", time: "18:00",
    maxPassengers: 4, doneDate: null, duration: null,
    status: ReservationStatus.Cancelled,
    driver:     { id: "3", pictureUrl: PLACEHOLDER, name: "George Martin",    rating: 4.7, tripsCount: 12 },
    passengers: [{ id: "4", pictureUrl: PLACEHOLDER, name: "Fiona Dupuis",    rating: 4.3, tripsCount: 7  }],
  },
  {
    id: "4",
    tripId: "7",
    departure: "Gatineau", destination: "Ottawa",
    date: "2026-02-28", time: "12:00",
    maxPassengers: 3, doneDate: null, duration: null,
    status: ReservationStatus.Pending,
    driver:     { id: "4", pictureUrl: PLACEHOLDER, name: "Isabelle Lefevre", rating: 4.9, tripsCount: 25 },
    passengers: [{ id: "5", pictureUrl: PLACEHOLDER, name: "Hannah Moreau",   rating: 4.1, tripsCount: 9  }],
  },
  {
    id: "5",
    tripId: "5",
    departure: "Barrhaven", destination: "Nepean",
    date: "2026-03-01", time: "16:00",
    maxPassengers: 2, doneDate: "2026-03-01", duration: null,
    status: ReservationStatus.Completed,
    driver:     { id: "5", pictureUrl: PLACEHOLDER, name: "Karen Dupont",     rating: 4.5, tripsCount: 18 },
    passengers: [{ id: "6", pictureUrl: PLACEHOLDER, name: "Jack Wilson",     rating: 4.0, tripsCount: 4  }],
  },
  {
    id: "6",
    tripId: "6",
    departure: "Nepean", destination: "Barrhaven",
    date: "2026-02-24", time: "10:00",
    maxPassengers: 3, doneDate: null, duration: null,
    status: ReservationStatus.Confirmed,
    driver:     { id: "6", pictureUrl: PLACEHOLDER, name: "Mia Durand",       rating: 4.8, tripsCount: 22 },
    passengers: [{ id: "7", pictureUrl: PLACEHOLDER, name: "Leo Martin",      rating: 4.4, tripsCount: 6  }],
  },
  {
    id: "7",
    tripId: "7",
    departure: "Campus La Cité", destination: "Place d'Orléans",
    date: IMMINENT.date, time: IMMINENT.time,
    duration: 22,
    maxPassengers: 3, doneDate: null,
    status: ReservationStatus.Confirmed,
    driver:     { id: "7", pictureUrl: PLACEHOLDER, name: "Julie Tremblay",   rating: 4.5, tripsCount: 60 },
    passengers: [{ id: "8", pictureUrl: PLACEHOLDER, name: "Sophie Nguyen",   rating: 4.6, tripsCount: 12 }],
    isImminent: true,
  },
];
