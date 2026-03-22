"use client";

/**
 * @file stats.section.tsx
 * @description Section "Mes Statistiques" du dashboard — commune à tous les rôles.
 *
 * Affiche 4 indicateurs clés de l'utilisateur en grille 2×2 :
 * - Trajets partagés
 * - CO₂ économisé (kg)
 * - Note moyenne /5
 * - GoScore
 *
 * Chaque valeur est reçue en props depuis le parent (dashboard page),
 * qui sera responsable de l'appel API. Par défaut, les fixtures de dev sont utilisées.
 *
 * @uses UserStatsSummary — type depuis dashboard/types
 * @uses FIXTURE_USER_STATS — données de test (à remplacer par API)
 */

import Link from "next/link";
import Image from "next/image";

import { useAppState, Language } from "@/core/state/app_state";

import { UserStatsSummary } from "../../types/review.types";

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * StatisticSection
 *
 * @param stats Résumé des statistiques de l'utilisateur.
 *   Par défaut : données de test (FIXTURE_USER_STATS).
 *   TODO: Brancher sur GET /api/users/{userId}/stats/summary
 *   → Fournir depuis le parent (dashboard page) via props pour respecter
 *     le pattern "fetch en haut, affichage en bas".
 */
export function StatisticSection({ stats }: { stats: UserStatsSummary }) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const isPassenger = appState.userConnected?.role?.toString() === "passenger";

  /**
   * Formate la note moyenne : remplace le point décimal par une virgule en FR.
   * Ex: 4.2 → "4,2" (FR) ou "4.2" (EN)
   */
  const formattedRating = isFR
    ? stats.averageRating.toFixed(1).replace(".", ",")
    : stats.averageRating.toFixed(1);

  /**
   * Calcule un label textuel pour le GoScore.
   * TODO: Affiner les seuils avec la logique de gamification (voir manifeste §8.2)
   * Seuils actuels : >800 = "Hyper GO!", >600 = "Fast GO!", >400 = "GO!", sinon "En route"
   */
  const goScoreLabel = (() => {
    if (stats.goScore > 800) return isFR ? "Hyper GO!" : "Hyper GO!";
    if (stats.goScore > 600) return isFR ? "Fast GO!" : "Fast GO!";
    if (stats.goScore > 400) return isFR ? "GO!" : "GO!";
    return isFR ? "En route !" : "On the way!";
  })();

  return (
    <section className="w-full flex flex-col py-16 rounded-lg border shadow-md p-6 items-start bg-white justify-between">

      {/* ─── En-tête ───────────────────────────────────────────────────── */}
      <div className="-mt-10 justify-between flex relative w-full">
        <h2 className="absolute top-0 left-1 text-2xl text-black font-bold">
          {isFR ? "Mes Statistiques" : "My Statistics"}
        </h2>
        <Link
          href="/passenger/statistics"
          className="absolute top-1 right-1 text-sm text-blue-500 hover:underline"
        >
          {isFR ? "Voir plus" : "See more"} {">"}
        </Link>
      </div>

      <div className="w-full h-px my-4 mt-8 bg-black" />

      {/* ─── Grille 2×2 des statistiques ─────────────────────────────── */}
      <div
        className={`w-full h-full grid grid-cols-2 grid-rows-2 gap-0
          ${isPassenger ? "scale-x-115 scale-y-105 -mb-5 border-collapse" : "scale-110"}`}
      >
        {/* Cellule 1 : Trajets partagés */}
        <div className="border border-gray-200 w-full h-full flex flex-col items-center justify-center p-4">
          <Image
            src="/img/statistics.dashboard/statistics-trajets.png"
            alt="Trips Icon"
            width={100}
            height={100}
            className="object-contain"
          />
          <p className="text-xl text-center text-gray-900 font-light">
            <span className="text-[#08316e] font-bold">{stats.tripsCount}</span>{" "}
            <span className="text-black font-semibold">
              {isFR ? "Trajets" : "Trips"}
            </span>
            <br />
            {isFR ? "Partagé(s)" : "Shared"}
          </p>
        </div>

        {/* Cellule 2 : CO₂ économisé */}
        <div className="border border-gray-200 w-full h-full flex flex-col items-center justify-center p-4">
          <Image
            src="/img/statistics.dashboard/statistics-ecologie.png"
            alt="Ecology Icon"
            width={100}
            height={100}
            className="object-contain"
          />
          <p className="text-xl text-center text-gray-900 font-light">
            <span className="text-green-800 font-bold">{stats.co2SavedKg}</span>{" "}
            <span className="text-green-500 font-semibold">/kg Co₂</span>
            <br />
            {isFR ? "économisé(s)" : "Saved"}
          </p>
        </div>

        {/* Cellule 3 : Note moyenne */}
        <div className="border border-gray-200 w-full h-full flex flex-col items-center justify-center p-4">
          <Image
            src="/img/statistics.dashboard/statistics-note.png"
            alt="Rating Icon"
            width={100}
            height={100}
            className="object-contain"
          />
          <p className="text-xl text-center text-gray-900 font-light">
            <span className="text-amber-300 font-bold">
              {formattedRating} /{" "}
              <span className="text-lg">5</span>
            </span>{" "}
            <span className="text-black font-semibold">
              {isFR ? "Notes" : "Rating"}
            </span>
            <br />
            {isFR ? "Moyenne" : "Average"}
          </p>
        </div>

        {/* Cellule 4 : GoScore */}
        <div className="border border-gray-200 w-full h-full flex flex-col items-center justify-center p-4">
          <Image
            src="/img/statistics.dashboard/statistics-goscore.png"
            alt="GoScore Icon"
            width={100}
            height={100}
            className="object-contain"
          />
          <p className="text-xl text-center text-gray-900 font-light">
            <span className="text-blue-400 font-bold">{stats.goScore}</span>
            <br />
            <span className="text-blue-400 font-bold">GO!</span>
            <span className="text-black font-semibold">Score</span>
            <br />
            {/* Label dynamique calculé depuis le GoScore */}
            <span className="text-green-500 text-lg font-bold">{goScoreLabel}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
