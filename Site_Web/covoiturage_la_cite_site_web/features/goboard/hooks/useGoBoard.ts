/**
 * Hook pour la page Go! Board — expose les données de gamification.
 * Calcule les valeurs depuis la base JSON (useDb) au lieu des fixtures.
 */
"use client";

import { useMemo } from "react";
import { useDb } from "@/core/context/db.context";
import { useAppState } from "@/core/state/app_state";
import type {
  GoTier,
  Mission,
  EntreeClassement,
  DefiEcologique,
  EntreeHistoriquePts,
} from "@/features/goboard/types/goboard.types";

/** Détermine le palier en fonction du score */
function tierFromScore(score: number): GoTier {
  if (score >= 800) return "Excellent";
  if (score >= 600) return "Bon";
  if (score >= 400) return "Passable";
  return "Restreint";
}

/** Génère le label Go selon le tier */
function labelFromTier(tier: GoTier): string {
  const labels: Record<GoTier, string> = {
    Excellent:  "Hyper GOoooo!",
    Bon:        "On y est !",
    Passable:   "À améliorer",
    Restreint:  "Debut du voyage",
  };
  return labels[tier];
}

export function useGoBoard() {
  const { userConnected } = useAppState();
  const { myTrips, myReviews, users } = useDb();

  const userId = userConnected?.id ?? "";
  // Profil complet depuis la base JSON (core/models, pas domain/models)
  const userProfile = users.find((u) => u.id === userId);

  // ── Calcul du score et du tier ────────────────────────────────────────────
  const goScore = useMemo(() => {
    // Score de base : 5 pts par trajet complété + 10 pts par avis reçu ≥ 4
    const tripPts    = myTrips.filter((t) => t.status === "completed").length * 5;
    const reviewPts  = myReviews.filter((r) => r.rating >= 4).length * 10;
    // On ajoute le score persisté de l'utilisateur comme socle
    const base = userProfile?.goScore ?? 0;
    return Math.max(base, tripPts + reviewPts);
  }, [myTrips, myReviews, userConnected]);

  const tier  = useMemo(() => tierFromScore(goScore), [goScore]);
  const goScoreLabel = useMemo(() => labelFromTier(tier), [tier]);

  // ── Points gagnés / perdus (30 derniers jours) ────────────────────────────
  const pointsGagnes = useMemo(
    () => myTrips.filter((t) => t.status === "completed").length * 5,
    [myTrips],
  );
  const pointsPerdus = 0; // Pas de pénalités dans les données actuelles

  // ── Classement ────────────────────────────────────────────────────────────
  const classement = useMemo<EntreeClassement[]>(() => {
    const sorted = [...users]
      .map((u) => ({
        utilisateurId: u.id,
        nom:      `${u.firstName} ${u.lastName}`,
        score:    (u as { goScore?: number }).goScore ?? 0,
        nbTrajets: (u.driverProfile?.totalTripsAsDriver ?? 0) +
                   (u.passengerProfile?.totalTripsAsPassenger ?? 0),
        note:  u.driverProfile?.averageRating ?? u.passengerProfile?.averageRating ?? 0,
        estMoi: u.id === userId,
      }))
      .sort((a, b) => b.score - a.score);

    return sorted.map((entry, idx) => ({ ...entry, rang: idx + 1 }));
  }, [users, userId]);

  const rang = useMemo(
    () => classement.find((e) => e.estMoi)?.rang ?? classement.length,
    [classement],
  );

  // ── Missions générées depuis les données réelles ───────────────────────────
  const completedTrips = myTrips.filter((t) => t.status === "completed").length;
  const missions = useMemo<Mission[]>(() => [
    {
      id: "m1", titre: "Compléter votre profil",
      description: "Photo, véhicule, préférences renseignés",
      pointsRecompense: 50, progres: 1, objectif: 1,
      estCompletee: true,
    },
    {
      id: "m2", titre: "Terminer votre premier trajet avec passager",
      description: "Complétez 1 trajet partagé complet",
      pointsRecompense: 30, progres: Math.min(completedTrips, 1), objectif: 1,
      estCompletee: completedTrips >= 1,
    },
    {
      id: "m3", titre: "Effectuer 3 trajets cette semaine",
      description: "3 trajets complétés dans la même semaine",
      pointsRecompense: 20, progres: Math.min(completedTrips, 3), objectif: 3,
      estCompletee: completedTrips >= 3,
    },
    {
      id: "m4", titre: "Laisser votre premier avis",
      description: "Évaluez un participant après un trajet",
      pointsRecompense: 15, progres: Math.min(myReviews.length, 1), objectif: 1,
      estCompletee: myReviews.length >= 1,
    },
  ], [completedTrips, myReviews.length]);

  // ── Défis écologiques ─────────────────────────────────────────────────────
  const co2Total = (userProfile?.driverProfile?.co2SavedKg ?? 0) +
                   (userProfile?.passengerProfile?.co2SavedKg ?? 0);

  const defisEco = useMemo<DefiEcologique[]>(() => [
    {
      id: "d1", nom: "Éco-Conscient",
      cible: "Économiser 50 kg de CO₂",
      progres: Math.min(Math.round((co2Total / 50) * 100), 100),
      statut: co2Total >= 50 ? "complete" : "actif",
      recompense: "Badge + email félicitations",
    },
    {
      id: "d2", nom: "Éco-Warrior",
      cible: "Économiser 200 kg de CO₂",
      progres: Math.min(Math.round((co2Total / 200) * 100), 100),
      statut: co2Total >= 200 ? "complete" : co2Total >= 50 ? "actif" : "verrouille",
      recompense: "Badge Expert Éco",
    },
  ], [co2Total]);

  // ── Historique des points ─────────────────────────────────────────────────
  const historiquePts = useMemo<EntreeHistoriquePts[]>(() =>
    myTrips
      .filter((t) => t.status === "completed")
      .slice(0, 5)
      .map((t) => ({
        label: `Trajet complété — ${t.arrival.label}`,
        pts:   5,
        signe: "+" as const,
        date:  new Date(t.departureDate),
      })),
    [myTrips],
  );

  return {
    goScore,
    goScoreLabel,
    tier,
    rang,
    pointsGagnes,
    pointsPerdus,
    missions,
    classement,
    defisEco,
    historiquePts,
    progressionScatter: [],
  };
}
