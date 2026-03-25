/**
 * GET /api/passenger/historique?passengerId=XXX
 *
 * Retourne l'historique des trajets d'un passager,
 * enrichi avec les infos du conducteur et des co-passagers.
 * Le client reçoit directement des Trip[] prêts à l'emploi.
 */

import { NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";

import type { ReservationModel } from "@/core/models/ReservationModel";
import type { TripModel } from "@/core/models/TripModel";
import type { UserModel } from "@/core/models/UserModel";

import { tripModelToTrip } from "@/features/dashboard/converters/dashboard.converter";

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

    // Pour chaque réservation du passager, enrichir le trajet avec conducteur et passagers
    const result = allReservations
      .filter((r) => r.passengerId === passengerId)
      .map((r) => {
        const trip = tripsMap.get(r.tripId);
        const driver = trip ? usersMap.get(trip.driverId) : undefined;
        if (!trip || !driver) return null;
        const passengers = trip.passengerIds
          .map((pid) => usersMap.get(pid))
          .filter((u): u is UserModel => u !== undefined);
        return tripModelToTrip(trip, driver, passengers);
      })
      .filter(Boolean);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/passenger/historique]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
