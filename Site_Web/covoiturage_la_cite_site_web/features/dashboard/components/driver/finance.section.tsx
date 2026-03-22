"use client";

/**
 * @file finance.section.tsx
 * @description Section "Finances" — exclusif au rôle Conducteur.
 *
 * Affiche un résumé financier en 3 blocs :
 * - Gain mensuel net (vert)
 * - Gain de la semaine : accumulé (vert) + en transit (gris, pas encore crédité)
 * - Pénalités actives (rouge — annulation tardive, no-show…)
 *
 * Aligne sur §7 (Paiement Simulé) et §21 (Pénalités Automatiques) du manifeste.
 *
 * Les données sont chargées et rafraîchies automatiquement via le hook useLiveFinance
 * (polling toutes les 30 s, sans rechargement de page). Un skeleton loader local
 * s'affiche lors du premier chargement.
 *
 * @uses useLiveFinance — hook de polling depuis features/dashboard/hooks
 * @uses DriverFinanceSummary — type depuis dashboard/types
 */

import { FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import Link from "next/link";

import { Language, useAppState } from "@/core/state/app_state";
import { useLiveFinance } from "../../hooks/useLiveFinance";

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * FinanceSection
 *
 * @param driverId Identifiant du conducteur connecté.
 *   Le composant gère lui-même le chargement et le rafraîchissement des données
 *   via GET /api/dashboard/driver/{driverId}/finance (polling 30 s).
 */
export function FinanceSection({ driverId }: { driverId: string }) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  // Données financières en temps réel + état du chargement
  const { finance, isLoading, error } = useLiveFinance(driverId);

  /**
   * Formate un montant avec 2 décimales et la devise.
   * Ex: 150.75 → "150.75 CAD"
   */
  const fmt = (amount: number) =>
    `${amount.toFixed(2)} ${finance?.currency ?? "CAD"}`;

  return (
    <section className="w-full py-5 px-5 flex flex-col items-center justify-center border rounded-lg shadow-md bg-[#08316ee5]">

      {/* ─── En-tête ────────────────────────────────────────────────── */}
      <div className="flex justify-between items-baseline mx-auto w-full mb-3">
        <h2 className="text-3xl text-white font-bold">
          {isFR ? "Mes Finances" : "My Finances"}
        </h2>
        <Link href="/driver/finance" aria-label={isFR ? "Voir le détail financier" : "View financial details"}>
          <FaExternalLinkAlt className="text-2xl text-gray-400 hover:text-white transition-colors" />
        </Link>
      </div>

      {/* ─── Corps blanc ────────────────────────────────────────────── */}
      <div className="w-full flex flex-col mx-auto justify-center items-center px-5 py-4 bg-white rounded-lg gap-y-1 min-h-[220px]">

        {/* ── Skeleton : affiché uniquement pendant le premier chargement ── */}
        {isLoading && <FinanceSkeleton />}

        {/* ── Erreur de chargement ─────────────────────────────────── */}
        {!isLoading && error && (
          <p className="text-sm text-red-500 text-center px-2">{error}</p>
        )}

        {/* ── Données financières (visibles dès que finance est disponible) ── */}
        {!isLoading && finance && (
          <>
            {/* Solde disponible */}
            <div className="w-full flex flex-col items-center">
              <span className="text-2xl text-gray-700 font-bold text-center">
                {isFR ? "Solde Disponible" : "Available Balance"}
              </span>
              <span className="text-3xl font-extrabold text-green-500">
                {fmt(finance.soldeDisponible)}
              </span>
            </div>

            <Divider />

            {/* Gains de la semaine */}
            <span className="text-2xl w-full text-center text-gray-700 font-bold mt-1">
              {isFR ? "Gain de la Semaine" : "This Week's Profit"}
            </span>

            {/* Accumulé */}
            <div className="w-full flex justify-between items-center px-2">
              <span className="text-xl text-gray-700 font-bold">
                {isFR ? "Accumulé" : "Accumulated"}
              </span>
              <span className="text-2xl font-bold text-green-500">
                {fmt(finance.weeklyProfit)}
              </span>
            </div>

            {/* En transit — gain des trajets terminés non encore crédités */}
            <div className="w-full flex justify-between items-center px-2">
              <span className="text-xl text-gray-700 font-bold flex items-center gap-1">
                {isFR ? "En transit" : "In transit"}
                <span title={isFR
                  ? "Montant en cours de validation — disponible après confirmation du trajet"
                  : "Amount under validation — available after trip confirmation"}>
                  <FaInfoCircle className="text-gray-400 text-base cursor-help" />
                </span>
              </span>
              <span className="text-2xl font-bold text-gray-500">
                {fmt(finance.weeklyPendingProfit)}
              </span>
            </div>

            <Divider />

            {/* Pénalités */}
            <div className="w-full flex flex-col items-center mt-1">
              <span className="text-2xl text-gray-700 font-bold text-center flex items-center gap-2">
                {isFR ? "Pénalités" : "Penalties"}
                <span
                  title={isFR
                    ? "Pénalités automatiques : annulation tardive, no-show (§21 manifeste)"
                    : "Automatic penalties: late cancellation, no-show (§21 manifesto)"}
                >
                  <FaInfoCircle className="text-gray-400 text-base cursor-help" />
                </span>
              </span>
              <span className={`text-3xl font-extrabold ${finance.penalties > 0 ? "text-red-500" : "text-green-500"}`}>
                {finance.penalties > 0 ? `- ${fmt(finance.penalties)}` : fmt(0)}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────────

/** Ligne de séparation réutilisable dans le bloc blanc */
function Divider() {
  return <div className="w-11/15 h-px bg-gray-300 rounded-full my-2" />;
}

/**
 * FinanceSkeleton
 * Placeholder animé (pulse) qui reproduit la structure du contenu financier.
 * Affiché uniquement lors du premier chargement pour éviter un "blanc" trop long.
 */
function FinanceSkeleton() {
  return (
    <div className="w-full flex flex-col items-center gap-y-3 animate-pulse">
      {/* Skeleton — Gain mensuel */}
      <div className="flex flex-col items-center gap-1 w-full">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-8 w-28 bg-gray-200 rounded" />
      </div>

      <div className="w-11/15 h-px bg-gray-200 rounded-full" />

      {/* Skeleton — Gain de la semaine */}
      <div className="h-5 w-44 bg-gray-200 rounded mx-auto" />
      <div className="w-full flex justify-between px-2">
        <div className="h-5 w-20 bg-gray-200 rounded" />
        <div className="h-6 w-24 bg-gray-200 rounded" />
      </div>
      <div className="w-full flex justify-between px-2">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-6 w-24 bg-gray-200 rounded" />
      </div>

      <div className="w-11/15 h-px bg-gray-200 rounded-full" />

      {/* Skeleton — Pénalités */}
      <div className="flex flex-col items-center gap-1 w-full">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
