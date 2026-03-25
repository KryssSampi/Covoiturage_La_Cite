"use client";

import { FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import Link from "next/link";

import { Language, useAppState } from "@/core/state/app_state";
import type { DriverFinanceSummary } from "@/features/dashboard/types";
import { FIXTURE_DRIVER_FINANCE } from "@/tests/fixtures/dashboard/finance.fixtures";

export function FinanceSection({
  finance = FIXTURE_DRIVER_FINANCE,
  isLoading = false,
  error = null,
}: {
  finance?: DriverFinanceSummary | null;
  isLoading?: boolean;
  error?: string | null;
}) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  const financeData = finance ?? FIXTURE_DRIVER_FINANCE;
  const fmt = (amount: number) =>
    `${amount.toFixed(2)} ${financeData.currency ?? "CAD"}`;

  return (
    <section className="w-full py-5 px-5 flex flex-col items-center justify-center border rounded-lg shadow-md bg-[#08316ee5]">
      <div className="flex justify-between items-baseline mx-auto w-full mb-3">
        <h2 className="text-3xl text-white font-bold">
          {isFR ? "Mes Finances" : "My Finances"}
        </h2>
        <Link href="/driver/finance" aria-label={isFR ? "Voir le detail financier" : "View financial details"}>
          <FaExternalLinkAlt className="text-2xl text-gray-400 hover:text-white transition-colors" />
        </Link>
      </div>

      <div className="w-full flex flex-col mx-auto justify-center items-center px-5 py-4 bg-white rounded-lg gap-y-1 min-h-[220px]">
        {isLoading && <FinanceSkeleton />}

        {!isLoading && error && (
          <p className="text-sm text-red-500 text-center px-2">{error}</p>
        )}

        {!isLoading && financeData && (
          <>
            <div className="w-full flex flex-col items-center">
              <span className="text-2xl text-gray-700 font-bold text-center">
                {isFR ? "Solde Disponible" : "Available Balance"}
              </span>
              <span className="text-3xl font-extrabold text-green-500">
                {fmt(financeData.soldeDisponible)}
              </span>
            </div>

            <Divider />

            <span className="text-2xl w-full text-center text-gray-700 font-bold mt-1">
              {isFR ? "Gain de la Semaine" : "This Week's Profit"}
            </span>

            <div className="w-full flex justify-between items-center px-2">
              <span className="text-xl text-gray-700 font-bold">
                {isFR ? "Accumule" : "Accumulated"}
              </span>
              <span className="text-2xl font-bold text-green-500">
                {fmt(financeData.weeklyProfit)}
              </span>
            </div>

            <div className="w-full flex justify-between items-center px-2">
              <span className="text-xl text-gray-700 font-bold flex items-center gap-1">
                {isFR ? "En transit" : "In transit"}
                <span title={isFR
                  ? "Montant en cours de validation - disponible apres confirmation du trajet"
                  : "Amount under validation - available after trip confirmation"}>
                  <FaInfoCircle className="text-gray-400 text-base cursor-help" />
                </span>
              </span>
              <span className="text-2xl font-bold text-gray-500">
                {fmt(financeData.weeklyPendingProfit)}
              </span>
            </div>

            <Divider />

            <div className="w-full flex flex-col items-center mt-1">
              <span className="text-2xl text-gray-700 font-bold text-center flex items-center gap-2">
                {isFR ? "Penalites" : "Penalties"}
                <span
                  title={isFR
                    ? "Penalites automatiques : annulation tardive, no-show"
                    : "Automatic penalties: late cancellation, no-show"}
                >
                  <FaInfoCircle className="text-gray-400 text-base cursor-help" />
                </span>
              </span>
              <span className={`text-3xl font-extrabold ${financeData.penalties > 0 ? "text-red-500" : "text-green-500"}`}>
                {financeData.penalties > 0 ? `- ${fmt(financeData.penalties)}` : fmt(0)}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Divider() {
  return <div className="w-11/15 h-px bg-gray-300 rounded-full my-2" />;
}

function FinanceSkeleton() {
  return (
    <div className="w-full flex flex-col items-center gap-y-3 animate-pulse">
      <div className="flex flex-col items-center gap-1 w-full">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-8 w-28 bg-gray-200 rounded" />
      </div>

      <div className="w-11/15 h-px bg-gray-200 rounded-full" />

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

      <div className="flex flex-col items-center gap-1 w-full">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
