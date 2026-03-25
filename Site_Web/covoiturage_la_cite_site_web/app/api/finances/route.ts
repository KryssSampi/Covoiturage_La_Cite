/**
 * GET /api/finances?userId=XXX&role=driver|passenger&periode=mois
 *
 * Retourne toutes les données de la page Finances en une seule requête.
 * Assemble : driver_finance_accounts | passenger_finance_accounts + bank_accounts + penalites.
 * Le paramètre `periode` filtre les transactions et génère l'histogramme par période.
 * Les messages de tendance sont générés dynamiquement.
 */

import { NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";

import type { BankAccountModel } from "@/core/models/BankAccountModel";
import type { DriverFinanceAccountModel } from "@/core/models/DriverFinanceAccountModel";
import type { PassengerFinanceAccountModel } from "@/core/models/PassengerFinanceAccountModel";
import type {
  PeriodeFinance,
  Transaction,
  Penalite,
  DonneesHistogramme,
  TrendMessage,
  FinancesDriverData,
  FinancesPassengerData,
  ResumeMensuelData,
  FinancesApiResponse,
} from "@/features/finances/types/finances.types";

// ─── Constantes ──────────────────────────────────────────────────────────────

const COMMISSION = 0.15;
const OBJECTIF_MENSUEL = 200;

type PenaliteRecord = {
  id: string;
  userId: string;
  trajetId?: string;
  type: string;
  montant: number;
  raison: string;
  statut: "active" | "prelevee" | "contestee" | "remboursee";
  createdAt: string;
  updatedAt: string;
};

// ─── Helpers : filtrage par période ──────────────────────────────────────────

/** Retourne la date de début selon la période sélectionnée */
function getStartDate(periode: PeriodeFinance): Date | null {
  const now = new Date();
  switch (periode) {
    case "7j":    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "mois":  return new Date(now.getFullYear(), now.getMonth(), 1);
    case "3mois": return new Date(now.getFullYear(), now.getMonth() - 2, 1);
    case "tout":  return null;
  }
}

/** Retourne le label d'un intervalle pour l'histogramme selon la période */
function getIntervalLabel(date: Date, periode: PeriodeFinance): string {
  const options: Intl.DateTimeFormatOptions = { timeZone: "America/Toronto" };
  switch (periode) {
    case "7j": {
      // Par jour : "Lun 17", "Mar 18"...
      const jour = date.toLocaleDateString("fr-CA", { ...options, weekday: "short" });
      const num = date.getDate();
      return `${jour} ${num}`;
    }
    case "mois":
    case "3mois": {
      // Par semaine : "S10", "S11"...
      const oneJan = new Date(date.getFullYear(), 0, 1);
      const week = Math.ceil(((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
      return `S${week}`;
    }
    case "tout": {
      // Par mois : "Jan", "Fév"...
      return date.toLocaleDateString("fr-CA", { ...options, month: "short" });
    }
  }
}

/** Titre dynamique de l'histogramme selon le rôle et la période */
function getHistogrammeTitle(role: string, periode: PeriodeFinance): string {
  const isDriver = role === "driver";
  const labelMontant = isDriver ? "Revenus" : "Économies";
  switch (periode) {
    case "7j":    return `${labelMontant} par jour`;
    case "mois":  return `${labelMontant} par semaine`;
    case "3mois": return `${labelMontant} par semaine`;
    case "tout":  return `${labelMontant} par mois`;
  }
}

// ─── Helpers : tendances ─────────────────────────────────────────────────────

function buildTrend(variant: TrendMessage["variant"], bold: string, texte: string): TrendMessage {
  return { variant, texteBold: bold, texte };
}

// ─── Route GET ───────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId  = searchParams.get("userId");
    const role    = searchParams.get("role") as "driver" | "passenger" | null;
    const periode = (searchParams.get("periode") ?? "mois") as PeriodeFinance;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Les paramètres userId et role sont requis" },
        { status: 400 },
      );
    }

    const startDate = getStartDate(periode);

    // ── Lecture des comptes bancaires ────────────────────────────────────────
    const allBankAccounts = persistenceManager.readAll<BankAccountModel>("bank_accounts");
    const bankAccounts = allBankAccounts.filter((a) => a.userId === userId);

    // ── Assemblage selon le rôle ────────────────────────────────────────────
    let transactions: Transaction[] = [];
    let histogramme: DonneesHistogramme[] = [];
    let driverData: FinancesDriverData | null = null;
    let passengerData: FinancesPassengerData | null = null;
    let tendanceSolde: TrendMessage;
    let tendanceHistogramme: TrendMessage;
    let tendanceTransactions: TrendMessage;
    let tendancePenalites: TrendMessage | undefined;

    if (role === "driver") {
      // ── Conducteur ─────────────────────────────────────────────────────────
      const allDFA = persistenceManager.readAll<DriverFinanceAccountModel>("driver_finance_accounts");
      const dfa = allDFA.find((a) => a.driverId === userId);

      if (!dfa) {
        return NextResponse.json(
          { error: "Compte conducteur introuvable" },
          { status: 404 },
        );
      }

      // Pénalités
      const allPenalites = persistenceManager.readAll<PenaliteRecord>("penalites");
      const userPenalites = allPenalites.filter((p) => p.userId === userId);
      const activePenalites = userPenalites.filter((p) => p.statut === "active" || p.statut === "contestee");

      // Transactions filtrées par période
      const filteredTxns = dfa.transactions.filter((t) => {
        if (!startDate) return true;
        return new Date(t.createdAt) >= startDate;
      });

      transactions = filteredTxns.map((t) => ({
        id: t.id,
        type: t.type === "revenu_trajet" ? "revenu" as const
            : t.type === "penalite" ? "penalite" as const
            : t.type === "retrait_banque" ? "retrait" as const
            : "transit" as const,
        montant: t.montant,
        description: t.description,
        date: t.createdAt,
        trajetId: t.trajetId,
        statut: t.statut === "confirme" ? "confirme" as const
              : t.statut === "en_transit" ? "transit" as const
              : "penalite" as const,
      }));

      // Histogramme agrégé par période
      const histMap = new Map<string, DonneesHistogramme>();
      for (const t of filteredTxns) {
        const d = new Date(t.createdAt);
        const label = getIntervalLabel(d, periode);
        const existing = histMap.get(label) ?? { label, montantPrincipal: 0, montantSecondaire: 0, nbTrajets: 0 };
        if (t.type === "revenu_trajet") {
          existing.montantPrincipal += t.montant;
          existing.nbTrajets += 1;
        } else if (t.type === "penalite") {
          existing.montantSecondaire += t.montant;
        }
        histMap.set(label, existing);
      }
      histogramme = Array.from(histMap.values());

      // Pénalités formatées
      const penalitesActives: Penalite[] = activePenalites.map((p) => {
        const raisonType = p.type.includes("retard") ? "retard" as const
                         : p.type.includes("annulation") ? "annulation" as const
                         : "comportement" as const;
        return {
          id: p.id,
          raison: raisonType,
          montant: p.montant,
          date: p.createdAt,
          trajetId: p.trajetId ?? "",
          description: p.raison,
          routeDescription: `Pénalité appliquée le ${new Date(p.createdAt).toLocaleDateString("fr-CA")}`,
          estContestable: p.statut === "active",
        };
      });

      // Résumé mensuel
      const now = new Date();
      const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
      const txnsMois = dfa.transactions.filter((t) => new Date(t.createdAt) >= debutMois);
      const revenuMois = txnsMois
        .filter((t) => t.type === "revenu_trajet")
        .reduce((s, t) => s + t.montant, 0);
      const commissionMontant = parseFloat(((revenuMois / (1 - COMMISSION)) * COMMISSION).toFixed(2));
      const nbTrajetsMois = txnsMois.filter((t) => t.type === "revenu_trajet").length;

      // Gain de la semaine courante
      const debutSemaine = new Date(now);
      debutSemaine.setDate(now.getDate() - now.getDay());
      debutSemaine.setHours(0, 0, 0, 0);
      const gainSemaine = dfa.transactions
        .filter((t) => t.type === "revenu_trajet" && new Date(t.createdAt) >= debutSemaine)
        .reduce((s, t) => s + t.montant, 0);
      const numSemaine = Math.ceil(((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);

      // Tendance résumé
      const moisPrec = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const finMoisPrec = new Date(now.getFullYear(), now.getMonth(), 0);
      const revenuMoisPrec = dfa.transactions
        .filter((t) => t.type === "revenu_trajet" && new Date(t.createdAt) >= moisPrec && new Date(t.createdAt) <= finMoisPrec)
        .reduce((s, t) => s + t.montant, 0);
      const pctVsMoisPrec = revenuMoisPrec > 0
        ? Math.round(((revenuMois - revenuMoisPrec) / revenuMoisPrec) * 100)
        : revenuMois > 0 ? 100 : 0;

      const moisLabel = now.toLocaleDateString("fr-CA", { month: "long", year: "numeric" });
      const jourActuel = now.getDate();
      const moisFr = now.toLocaleDateString("fr-CA", { month: "long" });

      const resumeMensuel: ResumeMensuelData = {
        titre: `Résumé ${moisLabel.charAt(0).toUpperCase() + moisLabel.slice(1)}`,
        sousTitre: `01–${jourActuel} ${moisFr}`,
        revenu: parseFloat(revenuMois.toFixed(2)),
        gainSemaine: parseFloat(gainSemaine.toFixed(2)),
        labelSemaine: `Sem. ${numSemaine}`,
        objectif: OBJECTIF_MENSUEL,
        commission: COMMISSION,
        nbTrajets: nbTrajetsMois,
        nbTrajetsCompletes: dfa.transactions.filter((t) => t.type === "revenu_trajet" && t.statut === "confirme").length,
        tendance: buildTrend(
          pctVsMoisPrec > 5 ? "up" : pctVsMoisPrec < -5 ? "down" : "stable",
          `${pctVsMoisPrec >= 0 ? "+" : ""}${pctVsMoisPrec}% vs mois précédent`,
          revenuMois >= OBJECTIF_MENSUEL
            ? "Objectif atteint — félicitations !"
            : `Encore ${(OBJECTIF_MENSUEL - revenuMois).toFixed(2)} $ pour atteindre votre objectif.`,
        ),
      };

      // Nombre de trajets en cours (transit)
      const nbTrajetsEnCours = dfa.transactions.filter((t) => t.statut === "en_transit").length;

      driverData = {
        soldeDisponible: dfa.soldeDisponible,
        soldeTransit: dfa.soldeEnTransit,
        penalitesTotal: dfa.soldePenalites,
        nbTrajetsEnCours,
        nbPenalitesActives: activePenalites.length,
        resumeMensuel,
        penalitesActives,
        scatterGainParHeure: [],
      };

      // Tendances conducteur
      tendanceSolde = buildTrend(
        dfa.soldeDisponible >= 20 ? "up" : "stable",
        dfa.soldeDisponible >= 20
          ? `${dfa.soldeDisponible.toFixed(2)} $ disponibles pour retrait`
          : `Seuil minimum de 20 $ non atteint`,
        dfa.soldeEnTransit > 0
          ? `${dfa.soldeEnTransit.toFixed(2)} $ en transit — seront disponibles après confirmation des trajets.`
          : "Aucun montant en transit.",
      );

      const bestWeek = histogramme.reduce((best, h) => h.montantPrincipal > best.montantPrincipal ? h : best, histogramme[0] ?? { label: "—", montantPrincipal: 0, montantSecondaire: 0, nbTrajets: 0 });
      tendanceHistogramme = buildTrend(
        histogramme.length > 1 ? "up" : "stable",
        bestWeek.montantPrincipal > 0
          ? `${bestWeek.label} : votre meilleure période à ${bestWeek.montantPrincipal.toFixed(0)} $`
          : "Aucun revenu sur cette période",
        histogramme.length > 3
          ? "La tendance des dernières semaines est encourageante — continuez au même rythme."
          : "Continuez à publier des trajets pour augmenter vos revenus.",
      );

      tendanceTransactions = buildTrend(
        transactions.length > 0 ? "up" : "stable",
        `${transactions.length} transaction${transactions.length > 1 ? "s" : ""} sur la période`,
        transactions.length > 0
          ? `Dont ${transactions.filter((t) => t.type === "revenu").length} revenus positifs.`
          : "Aucune transaction enregistrée sur cette période.",
      );

      tendancePenalites = activePenalites.length > 0
        ? buildTrend(
            "down",
            `${activePenalites.length} pénalité${activePenalites.length > 1 ? "s" : ""} active${activePenalites.length > 1 ? "s" : ""} ce mois`,
            "Prévenez vos passagers à l'avance pour éviter les pénalités futures.",
          )
        : buildTrend("up", "Aucune pénalité active", "Excellent comportement — continuez ainsi !");

    } else {
      // ── Passager ───────────────────────────────────────────────────────────
      const allPFA = persistenceManager.readAll<PassengerFinanceAccountModel>("passenger_finance_accounts");
      const pfa = allPFA.find((a) => a.passengerId === userId);

      if (!pfa) {
        return NextResponse.json(
          { error: "Compte passager introuvable" },
          { status: 404 },
        );
      }

      // Transactions filtrées par période
      const filteredTxns = pfa.transactions.filter((t) => {
        if (!startDate) return true;
        return new Date(t.createdAt) >= startDate;
      });

      transactions = filteredTxns.map((t) => ({
        id: t.id,
        type: t.type === "economie_trajet" ? "economie" as const
            : t.type === "paiement_trajet" ? "paiement" as const
            : t.type === "remboursement" ? "remboursement" as const
            : "holding" as const,
        montant: t.montant,
        description: t.description,
        date: t.createdAt,
        trajetId: t.trajetId,
        statut: t.statut === "confirme" ? "confirme" as const
              : t.statut === "en_transit" ? "transit" as const
              : "rembourse" as const,
      }));

      // Histogramme des économies agrégé par période
      const histMap = new Map<string, DonneesHistogramme>();
      for (const t of filteredTxns) {
        const d = new Date(t.createdAt);
        const label = getIntervalLabel(d, periode);
        const existing = histMap.get(label) ?? { label, montantPrincipal: 0, montantSecondaire: 0, nbTrajets: 0 };
        if (t.type === "economie_trajet") {
          existing.montantPrincipal += t.montant;
          existing.nbTrajets += 1;
        } else if (t.type === "paiement_trajet") {
          existing.montantSecondaire += t.montant;
        }
        histMap.set(label, existing);
      }
      histogramme = Array.from(histMap.values());

      passengerData = {
        economiesEstimees: pfa.economiesEstimees,
        fondsEnTransit: pfa.fondsEnTransit,
        totalDepense: pfa.totalDepense,
        nbTrajetsCompletes: pfa.nbTrajetsCompletes,
      };

      // Tendances passager
      tendanceSolde = buildTrend(
        pfa.economiesEstimees > 0 ? "up" : "stable",
        `${pfa.economiesEstimees.toFixed(2)} $ économisés au total`,
        pfa.fondsEnTransit > 0
          ? `${pfa.fondsEnTransit.toFixed(2)} $ en transit — en attente de confirmation.`
          : "Aucun fonds en transit.",
      );

      const totalEconomiesHistogramme = histogramme.reduce((s, h) => s + h.montantPrincipal, 0);
      tendanceHistogramme = buildTrend(
        totalEconomiesHistogramme > 0 ? "up" : "stable",
        totalEconomiesHistogramme > 0
          ? `${totalEconomiesHistogramme.toFixed(2)} $ économisés sur la période`
          : "Aucune économie enregistrée sur cette période",
        `Le covoiturage vous a permis d'économiser par rapport au transport individuel.`,
      );

      tendanceTransactions = buildTrend(
        transactions.length > 0 ? "up" : "stable",
        `${transactions.length} transaction${transactions.length > 1 ? "s" : ""} sur la période`,
        transactions.length > 0
          ? `${pfa.nbTrajetsCompletes} trajet${pfa.nbTrajetsCompletes > 1 ? "s" : ""} complété${pfa.nbTrajetsCompletes > 1 ? "s" : ""} au total.`
          : "Aucune transaction enregistrée.",
      );
    }

    // ── Réponse assemblée ────────────────────────────────────────────────────
    const response: FinancesApiResponse = {
      userId,
      role,
      periode,
      transactions,
      histogramme,
      tendances: {
        solde: tendanceSolde,
        histogramme: tendanceHistogramme,
        transactions: tendanceTransactions,
        penalites: tendancePenalites,
      },
      bankAccounts,
      driver: driverData,
      passenger: passengerData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] GET /api/finances — erreur :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
