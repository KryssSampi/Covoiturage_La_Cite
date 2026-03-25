import { PublishedTripStatus } from "@/features/dashboard/types";
import {PublishedTrip} from "@/features/dashboard/types" ; 

// Génère une date/heure dans 15 min — le trajet sera toujours imminent
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

export const FIXTURE_PUBLISHED_TRIPS: PublishedTrip[] = [
  {
    id: "1",
driverId: "4",
    departure: "Ottawa",
    destination: "Montreal",
    date: "2026-02-23",
    time: "14:00",
    maxPassengers: 3,
    passengers: [
      { id: "1", pictureUrl: "/assets/placeholder/placeholer-profile-picture.png", name: "Alice Dupont", rating: 4.5, tripsCount: 10 },
      { id: "2", pictureUrl: "/assets/placeholder/placeholer-profile-picture.png", name: "Bob Martin", rating: 4.0, tripsCount: 8 },
      { id: "3", pictureUrl: "/assets/placeholder/placeholer-profile-picture.png", name: "Charlie Durand", rating: 4.8, tripsCount: 15 },
    ],
    price: 25,
    pendingRequests: 2,
    status: PublishedTripStatus.Confirmed,
    duration: 120,
    // Ottawa downtown → Montréal centre
    departureCoords:  [-75.6972, 45.4215],
    arrivalCoords:    [-73.5673, 45.5017],
  },
  {
    id: "2",
    driverId: "2",
    departure: "Campus La Cité",
    destination: "Gatineau",
    date: new Date().toISOString(),
    time: "09:00",
    maxPassengers: 2,
    passengers: [
      { id: "3", pictureUrl: "/assets/placeholder/placeholer-profile-picture.png", name: "David Lee", rating: 4.2, tripsCount: 5 },
    ],
    price: 15,
    pendingRequests: 0,
    status: PublishedTripStatus.InProgress,
    duration: 45,
    // Campus La Cité → Gatineau (centre-ville)
    departureCoords:  [-75.6720, 45.4189],
    arrivalCoords:    [-75.7171, 45.4765],
  },
  {
    id: "3",
    driverId: "1",
    departure: "Orléans",
    destination: "Rideau",
    date: "2026-02-25",
    time: "18:00",
    maxPassengers: 4,
    passengers: [
      { id: "4", pictureUrl: "/assets/placeholder/placeholer-profile-picture.png", name: "Fiona Dupuis", rating: 4.3, tripsCount: 7 },
    ],
    price: 20,
    pendingRequests: 0,
    status: PublishedTripStatus.Cancelled,
    duration: 25,
    // Orléans → Rideau Centre
    departureCoords:  [-75.5159, 45.4556],
    arrivalCoords:    [-75.6878, 45.4261],
  },
  {
    id: "4",
    driverId: "4",
    departure: "Gatineau",
    destination: "Ottawa",
    date: "2026-02-28",
    time: "12:00",
    maxPassengers: 3,
    passengers: [
      { id: "5", pictureUrl: "/assets/placeholder/placeholer-profile-picture.png", name: "Hannah Moreau", rating: 4.1, tripsCount: 9 },
    ],
    price: 30,
    pendingRequests: 1,
    status: PublishedTripStatus.Published,
    duration: 35,
    // Gatineau centre → Ottawa downtown
    departureCoords:  [-75.7171, 45.4765],
    arrivalCoords:    [-75.6972, 45.4215],
  },
  {
    id: "5",
    driverId: "5",
    departure: "Barrhaven",
    destination: "Nepean",
    date: "2026-02-28",
    time: "16:00",
    maxPassengers: 2,
    passengers: [
      { id: "6", pictureUrl: "/assets/placeholder/placeholer-profile-picture.png", name: "Jack Wilson", rating: 4.0, tripsCount: 4 },
    ],
    price: 20,
    pendingRequests: 0,
    status: PublishedTripStatus.Completed,
    duration: 28,
    // Barrhaven → Nepean
    departureCoords:  [-75.7446, 45.2767],
    arrivalCoords:    [-75.7192, 45.3521],
  },
  {
    id: "6",
    driverId: "6",  
    departure: "Nepean",
    destination: "Barrhaven",
    date: "2026-02-24",
    time: "10:00",
    maxPassengers: 3,
    passengers: [
      { id: "7", pictureUrl: "/assets/placeholder/placeholer-profile-picture.png", name: "Leo Martin", rating: 4.4, tripsCount: 6 },
    ],
    price: 25,
    pendingRequests: 0,
    status: PublishedTripStatus.Confirmed,
    duration: 28,
    // Nepean → Barrhaven (inverse du trajet 5)
    departureCoords:  [-75.7192, 45.3521],
    arrivalCoords:    [-75.7446, 45.2767],
  },
  {
    id: "7",
    driverId: "7",
    departure: "Campus La Cité",
    destination: "Place d'Orléans",
    date: IMMINENT.date,
    time: IMMINENT.time,
    maxPassengers: 3,
    passengers: [
      { id: "8", pictureUrl: "/assets/placeholder/placeholer-profile-picture.png", name: "Sophie Nguyen", rating: 4.6, tripsCount: 12 },
    ],
    price: 12,
    pendingRequests: 0,
    status: PublishedTripStatus.Confirmed,
    duration: 22,
    departureCoords: [-75.6720, 45.4189],
    arrivalCoords:   [-75.5159, 45.4556],
    isImminent: true,
  },
];
