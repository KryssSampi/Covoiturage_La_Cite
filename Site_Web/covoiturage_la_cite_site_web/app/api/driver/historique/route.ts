/**
 * GET /api/driver/historique?driverId=XXX
 *
 * Retourne l'historique des trajets publiés par un conducteur,
 * enrichi avec les passagers confirmés et le nombre de demandes en attente.
 * Le client reçoit directement des PublishedTrip[] prêts à l'emploi.
 */

import { NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";

import type { TripModel } from "@/core/models/TripModel";
import type { ReservationModel } from "@/core/models/ReservationModel";
import type { UserModel } from "@/core/models/UserModel";

import { tripModelToPublishedTrip } from "@/features/dashboard/converters/dashboard.converter";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");

    if (!driverId) {
      return NextResponse.json(
        { error: "Le paramètre driverId est requis" },
        { status: 400 }
      );
    }

    // Lecture des données depuis la base JSON
    const allTrips = persistenceManager.readAll<TripModel>("trips");
    const allReservations = persistenceManager.readAll<ReservationModel>("reservations");
    const allUsers = persistenceManager.readAll<UserModel>("users");

    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    // Filtrer les trajets de ce conducteur, enrichir avec passagers et demandes
    const driverTrips = allTrips.filter((t) => t.driverId === driverId);

    const result = driverTrips.map((trip) => {
      const tripReservations = allReservations.filter((r) => r.tripId === trip.id);
      const passengers = tripReservations
        .filter((r) => r.status === "confirmed" || r.status === "completed")
        .map((r) => usersMap.get(r.passengerId))
        .filter((u): u is UserModel => u !== undefined);
      const pendingCount = tripReservations.filter(
        (r) => r.status === "pending"
      ).length;
      return tripModelToPublishedTrip(trip, passengers, pendingCount);
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/driver/historique]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
