/**
 * @file trips.fixtures.ts
 * @description DonnÃ©es de test pour PublishedTripSection (conducteur).
 * âš ï¸ DÃ‰VELOPPEMENT UNIQUEMENT â€” Ã€ remplacer par un appel API.
 *
 * TODO: GET /api/driver/{userId}/trips?status=active&limit=10
 *   Retourne les trajets publiÃ©s triÃ©s par OrganizeTrips (InProgress â†’ Ã  venir â†’ terminÃ©s â†’ annulÃ©s)
 */

import { Reservation, ReservationStatus } from "@/features/dashboard/types";
import { Trip } from "@/features/dashboard/types/trip.types";

const PLACEHOLDER = "/assets/placeholder/placeholer-profile-picture.png";

// GÃ©nÃ¨re une date/heure dans 15 min â€” le trajet sera toujours imminent
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

export const FIXTURES_TRIPS: Trip[] = [
  {
    id: "1",
    departure: "Ottawa",
    destination: "Montreal",
    date: "2026-02-23",
    time: "14:00",
    price: 25,
    maxPassengers: 3,
    doneDate: null,
    driver: { id: "1", pictureUrl: PLACEHOLDER, name: "Charlie Durand",    rating: 4.8, tripsCount: 20 },
    passengers: [
      { id: "1", pictureUrl: PLACEHOLDER, name: "Alice Dupont",   rating: 4.5, tripsCount: 10 },
      { id: "2", pictureUrl: PLACEHOLDER, name: "Bob Martin",     rating: 4.0, tripsCount: 8  },
      { id: "3", pictureUrl: PLACEHOLDER, name: "Charlie Durand", rating: 4.8, tripsCount: 15 },
    ],
  },
  {
    id: "2",
    departure: "Campus La CitÃ©",
    destination: "Gatineau",
    date: new Date().toISOString(),
    time: "09:00",
    price: 30,
    maxPassengers: 2,
    doneDate: null,
    driver:     { id: "2", pictureUrl: PLACEHOLDER, name: "Eve Smith",        rating: 4.6, tripsCount: 15 },
    passengers: [{ id: "3", pictureUrl: PLACEHOLDER, name: "David Lee",        rating: 4.2, tripsCount: 5  }],
  },
  {
    id: "3",
    departure: "OrlÃ©ans",
    destination: "Rideau",
    date: "2026-02-25",
    time: "18:00",
    price: 35,
    maxPassengers: 4,
    doneDate: null,
    driver:     { id: "3", pictureUrl: PLACEHOLDER, name: "George Martin",    rating: 4.7, tripsCount: 12 },
    passengers: [{ id: "4", pictureUrl: PLACEHOLDER, name: "Fiona Dupuis",    rating: 4.3, tripsCount: 7  }],
  },
  {
    id: "4",
    departure: "Gatineau",
    destination: "Ottawa",
    date: "2026-02-28",
    time: "12:00",
    price: 40,
    maxPassengers: 3,
    doneDate: null,
    driver:     { id: "4", pictureUrl: PLACEHOLDER, name: "Isabelle Lefevre", rating: 4.9, tripsCount: 25 },
    passengers: [{ id: "5", pictureUrl: PLACEHOLDER, name: "Hannah Moreau",   rating: 4.1, tripsCount: 9  }],
  },
  {
    id: "5",
    departure: "Barrhaven",
    destination: "Nepean",
    date: "2026-03-01",
    time: "16:00",
    price: 45,
    maxPassengers: 2,
    doneDate: null,
    driver:     { id: "5", pictureUrl: PLACEHOLDER, name: "Karen Dupont",     rating: 4.5, tripsCount: 18 },
    passengers: [{ id: "6", pictureUrl: PLACEHOLDER, name: "Jack Wilson",     rating: 4.0, tripsCount: 4  }],
  },
  {
    id: "6",
    departure: "Nepean",
    destination: "Barrhaven",
    date: "2026-02-24",
    time: "10:00",
    price: 50,
    maxPassengers: 3,
    doneDate: null,
    driver:     { id: "6", pictureUrl: PLACEHOLDER, name: "Mia Durand",       rating: 4.8, tripsCount: 22 },
    passengers: [{ id: "7", pictureUrl: PLACEHOLDER, name: "Leo Martin",      rating: 4.4, tripsCount: 6  }],
  },
  {
    id: "7",
    departure: "Campus La CitÃ©",
    destination: "Place d'OrlÃ©ans",
    date: IMMINENT.date,
    time: IMMINENT.time,
    price: 12,
    maxPassengers: 3,
    doneDate: null,
    driver:     { id: "7", pictureUrl: PLACEHOLDER, name: "Julie Tremblay",   rating: 4.5, tripsCount: 60 },
    passengers: [{ id: "8", pictureUrl: PLACEHOLDER, name: "Sophie Nguyen",   rating: 4.6, tripsCount: 12 }],
    isImminent: true,
  },
];
