import { NextRequest, NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";
import { initGoTaskListener } from "@/tests/db/gotask-to-goevent";
import type {
  GoTask,
  GoEvent,
  GoTier,
  EcoChallenge,
  EcoChallengeAvecProgression,
  EntreeClassement,
  ClassementEntry,
  GoBoardApiResponse,
} from "@/features/goboard/types/goboard.types";

// Initialise le listener GoTask -> GoEvent au premier import de cette route
initGoTaskListener();

/** Détermine le palier en fonction du score */
function tierFromScore(score: number): GoTier {
  if (score >= 800) return "Excellent";
  if (score >= 600) return "Bon";
  if (score >= 400) return "Passable";
  return "Restreint";
}

/**
 * GET /api/goboard?userId=...
 * Retourne les données complètes du Go! Board pour un utilisateur.
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId requis" }, { status: 400 });
  }

  try {
    // ── GoTasks avec progression de l'utilisateur ──────────────────────────
    const allTasks = persistenceManager.readAll<GoTask>("gotasks");

    // ── GoScore depuis le classement hebdomadaire ──────────────────────────
    const classementEntries = persistenceManager.readAll<ClassementEntry>("goboard_classement");
    const userEntry = classementEntries.find((e) => e.utilisateurId === userId);
    const goScore = userEntry?.goScore ?? 0;
    const tier = tierFromScore(goScore);

    // ── Classement trié par score descendant avec rang ─────────────────────
    const sorted = [...classementEntries].sort((a, b) => b.goScore - a.goScore);
    const classement: EntreeClassement[] = sorted.map((entry, idx) => ({
      rang: idx + 1,
      utilisateurId: entry.utilisateurId,
      nom: entry.nom,
      score: entry.goScore,
      estMoi: entry.utilisateurId === userId,
    }));

    const rang = classement.find((e) => e.estMoi)?.rang ?? classement.length;

    // ── Points gagnés / perdus (calculés depuis les GoTasks complétées) ────
    const pointsGagnes = allTasks.reduce((sum, task) => {
      const prog = task.progression.find((p) => p.userId === userId);
      return sum + (prog?.isDone ? task.points : 0);
    }, 0);
    const pointsPerdus = 0;

    // ── Défis écologiques avec progression CO₂ de l'utilisateur ────────────
    const users = persistenceManager.readAll<{ id: string; driverProfile?: { co2SavedKg?: number }; passengerProfile?: { co2SavedKg?: number } }>("users");
    const userProfile = users.find((u) => u.id === userId);
    const co2Total = (userProfile?.driverProfile?.co2SavedKg ?? 0) +
                     (userProfile?.passengerProfile?.co2SavedKg ?? 0);

    const ecoChallenges = persistenceManager.readAll<EcoChallenge>("eco_challenges");
    const defisEco: EcoChallengeAvecProgression[] = ecoChallenges.map((ec) => {
      const progres = Math.min(Math.round((co2Total / ec.cibleCO2Kg) * 100), 100);
      let statut: "actif" | "verrouille" | "complete";
      if (progres >= 100) {
        statut = "complete";
      } else if (co2Total >= (ec.cibleCO2Kg * 0.1)) {
        // Actif si l'utilisateur a au moins 10% de la cible
        statut = "actif";
      } else {
        statut = "verrouille";
      }
      return { ...ec, progres, statut };
    });

    // ── GoEvents de l'utilisateur (triés par date décroissante) ────────────
    const allEvents = persistenceManager.readAll<GoEvent>("goevents");
    const goEvents = allEvents
      .filter((e) => e.utilisateurId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // ── Réponse ────────────────────────────────────────────────────────────
    const response: GoBoardApiResponse = {
      goScore,
      tier,
      rang,
      pointsGagnes,
      pointsPerdus,
      goTasks: allTasks,
      classement,
      defisEco,
      goEvents,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/goboard] GET error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les données GoBoard" },
      { status: 500 },
    );
  }
}
