"use client";

/**
 * Page Mes Finances — Revenus, pénalités, transactions et retraits.
 * La section retrait (CardRetrait) + bouton "Retirer" sont masqués pour les passagers.
 * Les sous-composants sont importés depuis ./components/.
 */

import React from "react";
import { FaCoins, FaArrowLeft } from "react-icons/fa6";
import FeatureHeader from "@/shared/components/FeatureHeader";
import { useFinances } from "@/features/finances/hooks/useFinances";
import { useAppState } from "@/core/state/app_state";

// ─── Sous-composants UI ──────────────────────────────────────────────────────
import PeriodSelector from "./ui/PeriodSelector";

// ─── Sous-composants feature ─────────────────────────────────────────────────
import CardSolde          from "./CardSolde";
import CardResumeMensuel  from "./CardResumeMensuel";
import CardHistogramme    from "./CardHistogramme";
import CardScatter        from "./CardScatter";
import CardPenalites      from "./CardPenalites";
import CardTransactions   from "./CardTransactions";
import CardRetrait        from "./CardRetrait";
import CardBankAccount    from "./CardBankAccount";

// PAGE PRINCIPALE â€” MES FINANCES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface FinancesPageProps {
  /** RÃ´le de l'utilisateur â€” dÃ©termine la visibilitÃ© de la section retrait */
  role?: "driver" | "passenger";
}

export default function FinancesPage({ role = "driver" }: FinancesPageProps) {
  const {
    periode, setPeriode, periodes,
    soldeDisponible, soldeTransit, penalitesTotal,
    revenuMensuel, objectifMensuel, commission, nbTrajetsPayants,
    transactions, penalitesActives, historiqueParSemaine,
    ibanMasque,
  } = useFinances();

  const { userConnected } = useAppState();
  const isDriver = role === "driver";

  return (
    <div className="min-h-screen bg-[#f0f4fb]">
      <FeatureHeader
        breadcrumb="Mes Finances"
        title={<span className="flex items-center gap-2"><FaCoins className="text-[#7dd3fc]" size={22} /> Mes Finances</span>}
        subtitle="Revenus, pÃ©nalitÃ©s, transactions et retraits"
      >
        <PeriodSelector periodes={periodes} active={periode} onChange={setPeriode} />
      </FeatureHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 md:px-10 py-5">

        {/* Ligne 1 : Solde (1col) + RÃ©sumÃ© (2col) */}
        <CardSolde solde={soldeDisponible} transit={soldeTransit} penalites={penalitesTotal} isDriver={isDriver} />
        <CardResumeMensuel revenu={revenuMensuel} objectif={objectifMensuel} commission={commission} nbTrajets={nbTrajetsPayants} />

        {/* Ligne 2 : Histogramme (2col) + Scatter (1col) */}
        <CardHistogramme data={historiqueParSemaine} />
        <CardScatter />

        {/* Ligne 3 : PÃ©nalitÃ©s (1col) + Transactions (2col) */}
        <CardPenalites penalites={penalitesActives} />
        <CardTransactions transactions={transactions} />

        {/* Ligne 4 : Retrait simulé (3col) — Conducteur uniquement */}
        {isDriver && <CardRetrait ibanMasque={ibanMasque} />}

        {/* Ligne 5 : Compte bancaire simulé (TEST — toujours visible) */}
        {userConnected?.id && (
          <CardBankAccount userId={userConnected.id} isDriver={isDriver} />
        )}
      </div>

      {/* Lien retour */}
      <div className="px-6 md:px-10 pb-6">
        <button className="flex items-center gap-2 text-[#08316e] text-xs font-semibold cursor-pointer bg-transparent border-none hover:underline">
          <FaArrowLeft size={10} /> Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}