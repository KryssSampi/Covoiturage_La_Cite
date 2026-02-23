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
 * @uses DriverFinanceSummary — type depuis dashboard/types/driver.types
 * @uses FIXTURE_DRIVER_FINANCE — données de test (à remplacer par API)
 */

import { FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import Link from "next/link";

import { Language, useAppState } from "@/core/state/app_state";
import { DriverFinanceSummary } from "../../types";
import { FIXTURE_DRIVER_FINANCE } from "@/tests/fixtures/dashboard/finance.fixtures";

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * FinanceSection
 *
 * @param finance Résumé financier du conducteur.
 *   Par défaut : FIXTURE_DRIVER_FINANCE.
 *   TODO: Brancher sur GET /api/driver/{userId}/finance/summary
 *   → { mensualProfit, weeklyProfit, weeklyPendingProfit, penalties, currency }
 */
export function FinanceSection({
  finance = FIXTURE_DRIVER_FINANCE,
}: {
  finance?: DriverFinanceSummary;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  /**
   * Formate un montant avec 2 décimales et la devise.
   * Ex: 150.75 → "150.75 CAD"
   */
  const fmt = (amount: number) => `${amount.toFixed(2)} ${finance.currency}`;

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
      <div className="w-full flex flex-col mx-auto justify-center items-center px-5 py-4 bg-white rounded-lg gap-y-1">

        {/* ── Gain mensuel ──────────────────────────────────────────── */}
        <div className="w-full flex flex-col items-center">
          <span className="text-2xl text-gray-700 font-bold text-center">
            {isFR ? "Gain Mensuel" : "Monthly Profit"}
          </span>
          <span className="text-3xl font-extrabold text-green-500">
            {fmt(finance.mensualProfit)}
          </span>
        </div>

        <Divider />

        {/* ── Gains de la semaine ───────────────────────────────────── */}
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

        {/* ── Pénalités ─────────────────────────────────────────────── */}
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
      </div>
    </section>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────────

/** Ligne de séparation réutilisable dans le bloc blanc */
function Divider() {
  return <div className="w-11/15 h-px bg-gray-300 rounded-full my-2" />;
}
