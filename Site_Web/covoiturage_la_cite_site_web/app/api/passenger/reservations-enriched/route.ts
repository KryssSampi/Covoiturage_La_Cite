/**
 * GET /api/passenger/reservations-enriched?passengerId=XXX
 *
 * Retourne les réservations d'un passager,
 * enrichies avec les infos du trajet et du conducteur.
 * Le client reçoit directement des Reservation[] prêts à l'emploi.
 */

import { NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";

import type { ReservationModel } from "@/core/models/ReservationModel";
import type { TripModel } from "@/core/models/TripModel";
import type { UserModel } from "@/core/models/UserModel";

import { reservationToPassengerView } from "@/features/reservations/converters/reservation.converter";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const passengerId = searchParams.get("passengerId");

    if (!passengerId) {
      return NextResponse.json(
        { error: "Le paramètre passengerId est requis" },
        { status: 400 }
      );
    }

    // Lecture des données depuis la base JSON
    const allReservations = persistenceManager.readAll<ReservationModel>("reservations");
    const allTrips = persistenceManager.readAll<TripModel>("trips");
    const allUsers = persistenceManager.readAll<UserModel>("users");

    const tripsMap = new Map(allTrips.map((t) => [t.id, t]));
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    // Filtrer les réservations du passager, enrichir avec trajet et conducteur
    const result = allReservations
      .filter((r) => r.passengerId === passengerId)
      .map((r) => {
        const trip = tripsMap.get(r.tripId);
        const driver = usersMap.get(r.driverId);
        if (!trip || !driver) return null;
        return reservationToPassengerView(r, trip, driver);
      })
      .filter(Boolean);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/passenger/reservations-enriched]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
