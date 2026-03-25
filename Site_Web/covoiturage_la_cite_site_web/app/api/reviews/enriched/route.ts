/**
 * GET /api/reviews/enriched?revieweeId=XXX
 *
 * Retourne les avis reçus par un utilisateur,
 * enrichis avec les informations du reviewer (nom, avatar).
 * Le client reçoit directement des Review[] prêts à l'emploi.
 * Utilisé par les pages driver/reviews et passenger/reviews.
 */

import { NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";

import type { ReviewModel } from "@/core/models/ReviewModel";
import type { UserModel } from "@/core/models/UserModel";

import { reviewModelToReview } from "@/features/dashboard/converters/dashboard.converter";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const revieweeId = searchParams.get("revieweeId");

    if (!revieweeId) {
      return NextResponse.json(
        { error: "Le paramètre revieweeId est requis" },
        { status: 400 }
      );
    }

    // Lecture des données depuis la base JSON
    const allReviews = persistenceManager.readAll<ReviewModel>("reviews");
    const allUsers = persistenceManager.readAll<UserModel>("users");

    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    // Filtrer les avis reçus, enrichir avec les infos du reviewer
    const result = allReviews
      .filter((r) => r.revieweeId === revieweeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((r) => reviewModelToReview(r, usersMap.get(r.reviewerId)));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/reviews/enriched]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
