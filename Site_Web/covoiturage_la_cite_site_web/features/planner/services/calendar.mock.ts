import { addDays } from "date-fns";
import { getUserConnected } from "@/core/state/app_state";
import { Ride, Role, PublishedTripStatus, ReservationStatus } from "@/features/planner/types/calendar.types";
import { TODAY } from "@/features/planner/constants/calendar.constants";

// ─── GÉNÉRATEUR DE DONNÉES FICTIVES ──────────────────────────────────────────

/**
 * Génère un jeu de trajets fictifs selon le rôle de l'utilisateur.
 * Utilisé uniquement en développement / démonstration.
 *
 * @param role - "driver" ou "passenger"
 * @returns Tableau de trajets simulés
 */
export function makeMockRides(role: string): Ride[] {
  // Crée une Date pour aujourd'hui avec l'heure/minute spécifiées
  const s = (h: number, m: number): Date => {
    const d = new Date(TODAY);
    d.setHours(h, m, 0, 0);
    return d;
  };

  // Trajets fictifs du conducteur
  const driverRides: Ride[] = [
    { id: "r1", date: TODAY,              start: s(7, 23),  end: s(8, 47),  origin: "Campus La Cité", destination: "Orléans",        status: PublishedTripStatus.Confirmed  },
    { id: "r2", date: TODAY,              start: s(12, 0),  end: s(12, 45), origin: "Orléans",        destination: "Campus La Cité", status: PublishedTripStatus.Full       },
    { id: "r3", date: addDays(TODAY, 1),  start: s(7, 30),  end: s(8, 30),  origin: "Barrhaven",      destination: "Campus La Cité", status: PublishedTripStatus.Published  },
    { id: "r4", date: addDays(TODAY, 1),  start: s(17, 0),  end: s(18, 15), origin: "Campus La Cité", destination: "Barrhaven",      status: PublishedTripStatus.Confirmed  },
    { id: "r5", date: addDays(TODAY, 2),  start: s(8, 0),   end: s(9, 0),   origin: "Nepean",         destination: "Campus La Cité", status: PublishedTripStatus.InProgress },
    { id: "r6", date: addDays(TODAY, 3),  start: s(7, 0),   end: s(8, 30),  origin: "Campus La Cité", destination: "Gatineau",       status: PublishedTripStatus.Confirmed  },
    { id: "r7", date: addDays(TODAY, 3),  start: s(13, 30), end: s(14, 30), origin: "Gatineau",       destination: "Campus La Cité", status: PublishedTripStatus.Published  },
    { id: "r8", date: addDays(TODAY, 5),  start: s(7, 15),  end: s(8, 45),  origin: "Vanier",         destination: "Campus La Cité", status: PublishedTripStatus.Full       },
    { id: "r9", date: addDays(TODAY, -2), start: s(7, 0),   end: s(8, 0),   origin: "Campus La Cité", destination: "Orléans",        status: PublishedTripStatus.Completed  },
  ];

  // Trajets fictifs du passager
  const passengerRides: Ride[] = [
    { id: "r1", date: TODAY,             start: s(7, 23), end: s(8, 47), origin: "Campus La Cité", destination: "Orléans",        status: ReservationStatus.Confirmed },
    { id: "r2", date: addDays(TODAY, 1), start: s(8, 0),  end: s(9, 0),  origin: "Orléans",        destination: "Campus La Cité", status: ReservationStatus.Pending   },
    { id: "r3", date: addDays(TODAY, 3), start: s(17, 0), end: s(18, 0), origin: "Campus La Cité", destination: "Barrhaven",      status: ReservationStatus.Confirmed },
  ];

  return role === Role.DRIVER ? driverRides : passengerRides;
}

// ─── DONNÉES GLOBALES (DEV) ───────────────────────────────────────────────────

/**
 * Instance partagée des trajets fictifs, initialisée selon l'utilisateur connecté.
 * À remplacer par un appel API réel en production.
 */
const _user = getUserConnected();
export const MOCK_RIDES: Ride[] = makeMockRides(_user?.role ?? "passenger");
