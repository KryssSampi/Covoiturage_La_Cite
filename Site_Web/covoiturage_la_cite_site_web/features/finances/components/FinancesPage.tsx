"use client";

/**
 * Page Mes Finances - Composant de presentation pure.
 * Recoit toutes ses donnees via props - aucun fetch, aucun useDb.
 * Affichage conditionnel selon le role (driver / passenger).
 */

import React, { useRef } from "react";
import { FaCoins, FaArrowLeft } from "react-icons/fa6";
import FeatureHeader from "@/shared/components/FeatureHeader";

import type {
  PeriodeFinance,
  FinancesApiResponse,
} from "@/features/finances/types/finances.types";

// Sous-composants UI
import PeriodSelector from "./ui/PeriodSelector";

// Sous-composants feature
import CardSolde from "./CardSolde";
import CardResumeMensuel from "./CardResumeMensuel";
import CardHistogramme from "./CardHistogramme";
import CardScatter from "./CardScatter";
import CardPenalites from "./CardPenalites";
import CardTransactions from "./CardTransactions";
import CardRetrait from "./CardRetrait";
import CardBankAccount from "./CardBankAccount";

// Props de la page Finances
export interface FinancesPageProps {
  /** Role de l'utilisateur */
  role: "driver" | "passenger";
  /** Donnees completes de l'API */
  data: FinancesApiResponse | null;
  /** Periode active (geree par la page parente) */
  periode: PeriodeFinance;
  /** Callback changement de periode */
  onPeriodeChange: (p: PeriodeFinance) => void;
  /** Periodes disponibles */
  periodes: PeriodeFinance[];
  /** Callback retrait (conducteur uniquement) */
  onWithdraw?: (montant: number, bankAccountId: string) => Promise<{ ok: boolean; msg: string }>;
}

export default function FinancesPage({
  role,
  data,
  periode,
  onPeriodeChange,
  periodes,
  onWithdraw,
}: FinancesPageProps) {
  const isDriver = role === "driver";

  // Refs pour le scroll-to-card
  const retraitRef = useRef<HTMLDivElement>(null);
  const historiqueRef = useRef<HTMLDivElement>(null);

  // Scroll vers une section
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Etat de chargement
  if (!data) {
    return (
      <div className="min-h-screen bg-[#f0f4fb] flex items-center justify-center">
        <div className="text-[#7a90b8] text-sm animate-pulse">Chargement des finances...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4fb]">
      <FeatureHeader
        breadcrumb="Mes Finances"
        title={
          <span className="flex items-center gap-2">
            <FaCoins className="text-[#7dd3fc]" size={22} /> Mes Finances
          </span>
        }
        subtitle={
          isDriver
            ? "Revenus, penalites, transactions et retraits"
            : "Economies, transactions et historique"
        }
      >
        <PeriodSelector periodes={periodes} active={periode} onChange={onPeriodeChange} />
      </FeatureHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 md:px-10 py-5 items-stretch">
        {/* Ligne 1 : Solde / Economies + Resume mensuel conducteur ou BankAccount passager */}
        <div className={isDriver ? "" : "md:col-span-1"} >
          <CardSolde
            solde={isDriver ? data.driver!.soldeDisponible : data.passenger!.economiesEstimees}
            transit={isDriver ? data.driver!.soldeTransit : data.passenger!.fondsEnTransit}
            penalites={isDriver ? data.driver!.penalitesTotal : 0}
            isDriver={isDriver}
            nbTrajetsEnCours={isDriver ? data.driver!.nbTrajetsEnCours : 0}
            nbPenalitesActives={isDriver ? data.driver!.nbPenalitesActives : 0}
            tendance={data.tendances.solde}
            onRetirer={() => scrollTo(retraitRef)}
            onHistorique={() => scrollTo(historiqueRef)}
          />
        </div>
        {isDriver && data.driver?.resumeMensuel && (
          <div className="md:col-span-2 h-full">
            <CardResumeMensuel data={data.driver.resumeMensuel} />
          </div>
        )}
        {!isDriver && (
          <div className="md:col-span-2 h-full">
            <CardBankAccount
              account={data.bankAccounts[0] ?? null}
              isDriver={false}
            />
          </div>
        )}

        {/* Ligne 2 : Histogramme + Scatter conducteur ou pleine largeur passager */}
        <div className={`${isDriver ? "md:col-span-2" : "md:col-span-3"} h-full`}>
          <CardHistogramme
            data={data.histogramme}
            role={role}
            periode={periode}
            tendance={data.tendances.histogramme}
          />
        </div>
        {isDriver && <CardScatter />}

        {/* Ligne 3 : Penalites conducteur + Historique transactions */}
        {isDriver && (
          <CardPenalites
            penalites={data.driver!.penalitesActives}
            tendance={data.tendances.penalites}
          />
        )}
        <div ref={historiqueRef} className={`${isDriver ? "md:col-span-2" : "md:col-span-3"} h-full`}>
          <CardTransactions
            transactions={data.transactions}
            tendance={data.tendances.transactions}
            colSpanClass=""
          />
        </div>

        {/* Ligne 4 : Retrait (conducteur uniquement) */}
        {isDriver && (
          <div ref={retraitRef} className="md:col-span-3">
            <CardRetrait
              soldeDisponible={data.driver!.soldeDisponible}
              bankAccounts={data.bankAccounts}
              onWithdraw={onWithdraw!}
            />
          </div>
        )}

        {/* Ligne 5 : Compte bancaire (conducteur) */}
        {isDriver && data.bankAccounts.length > 0 && (
          <CardBankAccount
            account={data.bankAccounts[0]}
            isDriver={true}
          />
        )}
      </div>

      {/* Lien retour */}
      <div className="px-6 md:px-10 pb-6">
        <button className="btn-finance flex items-center gap-2 text-[#08316e] text-xs font-semibold cursor-pointer bg-transparent border-none hover:underline">
          <FaArrowLeft size={10} /> Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}