/**
 * GET /api/driver/reservation-requests?driverId=XXX
 *
 * Retourne les demandes de réservation en attente pour un conducteur,
 * déjà enrichies avec les infos du trajet et du passager.
 * Le client reçoit directement des ReservationRequest[] prêts à l'emploi.
 */

import { NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";

import type { ReservationModel } from "@/core/models/ReservationModel";
import type { TripModel } from "@/core/models/TripModel";
import type { UserModel } from "@/core/models/UserModel";

import { reservationModelToRequest } from "@/features/dashboard/converters/dashboard.converter";

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
    const allReservations = persistenceManager.readAll<ReservationModel>("reservations");
    const allTrips = persistenceManager.readAll<TripModel>("trips");
    const allUsers = persistenceManager.readAll<UserModel>("users");

    const tripsMap = new Map(allTrips.map((t) => [t.id, t]));
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    // Filtrer les réservations en attente pour ce conducteur puis enrichir
    const result = allReservations
      .filter((r) => r.driverId === driverId && r.status === "pending")
      .map((r) => {
        const trip = tripsMap.get(r.tripId);
        const passenger = usersMap.get(r.passengerId);
        if (!trip || !passenger) return null;
        return reservationModelToRequest(r, trip, passenger);
      })
      .filter(Boolean);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/driver/reservation-requests]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
