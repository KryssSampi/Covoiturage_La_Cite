/**
 * GET /api/finances?role=driver|passenger&periode=mois
 *
 * Délègue au Server Core puis formate la réponse pour le frontend.
 * Appels Server Core : driver/summary | passenger/summary + transactions + penalties.
 */

import { NextResponse } from "next/server";
import { FinanceService } from "@/server/services/FinanceService";
import { withAuth } from "@/server/auth";
import type {
  DriverFinanceSummaryDto,
  PassengerFinanceSummaryDto,
  TransactionResponseDto,
  PenaltyResponseDto,
  BankAccountResponseDto,
} from "@/server/services/FinanceService";

// ─── Types locaux (format attendu par le frontend) ─────────────────────────

type TrendVariant = "up" | "down" | "stable";
interface TrendMessage { variant: TrendVariant; texteBold: string; texte: string }

function buildTrend(variant: TrendVariant, bold: string, texte: string): TrendMessage {
  return { variant, texteBold: bold, texte };
}

// ─── Route GET ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") as "driver" | "passenger" | null;
    const periode = searchParams.get("periode") ?? "mois";

    if (!role) {
      return NextResponse.json(
        { error: "Le paramètre role est requis" },
        { status: 400 },
      );
    }

    // ── Appels parallèles au Server Core ──────────────────────────────────
    const [summaryRes, transactionsRes, penaltiesRes, bankAccountsRes] = await Promise.all([
      role === "driver"
        ? FinanceService.getDriverSummary(auth)
        : FinanceService.getPassengerSummary(auth),
      FinanceService.getTransactions(role, undefined, undefined, auth),
      FinanceService.getPenalties(auth),
      FinanceService.getBankAccounts(auth),
    ]);

    // ── Mapping transactions Server Core → format frontend ────────────────
    const rawTx: TransactionResponseDto[] = transactionsRes.data ?? [];
    const transactions = rawTx.map((t) => ({
      id: t.id,
      type: role === "driver"
        ? ("revenu" as const)
        : ("paiement" as const),
      montant: role === "driver" ? t.driverAmount : t.amount,
      description: `Trajet — ${t.amount.toFixed(2)} $`,
      date: t.createdAt,
      trajetId: t.tripId,
      statut: t.status === "Completed" || t.status === "completed"
        ? ("confirme" as const)
        : ("transit" as const),
    }));

    // ── Mapping pénalités ─────────────────────────────────────────────────
    const rawPen: PenaltyResponseDto[] = penaltiesRes.data ?? [];
    const penalitesActives = rawPen
      .filter((p) => p.status === "Active" || p.status === "active")
      .map((p) => ({
        id: p.id,
        raison: (p.type.includes("retard") ? "retard" : p.type.includes("annulation") ? "annulation" : "comportement") as "retard" | "annulation" | "comportement",
        montant: p.amount,
        date: p.createdAt,
        trajetId: "",
        description: p.reason,
        routeDescription: `Pénalité appliquée le ${new Date(p.createdAt).toLocaleDateString("fr-CA")}`,
        estContestable: p.status === "Active" || p.status === "active",
      }));

    // ── Assemblage selon le rôle ──────────────────────────────────────────
    let driverData = null;
    let passengerData = null;

    const confirmedCount = transactions.filter((t) => t.statut === "confirme").length;

    if (role === "driver") {
      const s = summaryRes.data as DriverFinanceSummaryDto | undefined;
      const solde = s?.availableBalance ?? 0;
      const transit = s?.pendingBalance ?? 0;
      const penalties = s?.activePenalties ?? 0;
      const earnings = s?.totalEarnings ?? 0;

      const moisLabel = new Date().toLocaleDateString("fr-CA", { month: "long", year: "numeric" });
      driverData = {
        soldeDisponible: solde,
        soldeTransit: transit,
        penalitesTotal: penalties,
        nbTrajetsEnCours: transactions.filter((t) => t.statut === "transit").length,
        nbPenalitesActives: penalitesActives.length,
        resumeMensuel: {
          titre: `Résumé ${moisLabel.charAt(0).toUpperCase() + moisLabel.slice(1)}`,
          sousTitre: `Au ${new Date().getDate()} du mois`,
          revenu: earnings,
          gainSemaine: 0,
          labelSemaine: "",
          objectif: 200,
          commission: 0.15,
          nbTrajets: transactions.length,
          nbTrajetsCompletes: confirmedCount,
          tendance: buildTrend("stable", "", ""),
        },
        penalitesActives,
        scatterGainParHeure: [],
      };
    } else {
      const s = summaryRes.data as PassengerFinanceSummaryDto | undefined;
      passengerData = {
        economiesEstimees: 0,
        fondsEnTransit: s?.pendingHoldings ?? 0,
        totalDepense: s?.totalSpent ?? 0,
        nbTrajetsCompletes: confirmedCount,
      };
    }

    // ── Tendances ─────────────────────────────────────────────────────────
    const tendanceSolde = role === "driver"
      ? buildTrend(
          (driverData?.soldeDisponible ?? 0) >= 20 ? "up" : "stable",
          `${(driverData?.soldeDisponible ?? 0).toFixed(2)} $ disponibles`,
          (driverData?.soldeTransit ?? 0) > 0
            ? `${(driverData?.soldeTransit ?? 0).toFixed(2)} $ en transit`
            : "Aucun montant en transit.",
        )
      : buildTrend(
          "stable",
          `${(passengerData?.totalDepense ?? 0).toFixed(2)} $ dépensés`,
          (passengerData?.fondsEnTransit ?? 0) > 0
            ? `${(passengerData?.fondsEnTransit ?? 0).toFixed(2)} $ en transit`
            : "Aucun fonds en transit.",
        );

    const tendanceTransactions = buildTrend(
      transactions.length > 0 ? "up" : "stable",
      `${transactions.length} transaction${transactions.length > 1 ? "s" : ""} sur la période`,
      transactions.length > 0
        ? `Dont ${confirmedCount} transaction${confirmedCount > 1 ? "s" : ""} confirmée${confirmedCount > 1 ? "s" : ""}.`
        : "Aucune transaction enregistrée.",
    );

    const tendancePenalites = penalitesActives.length > 0
      ? buildTrend("down", `${penalitesActives.length} pénalité(s) active(s)`, "Prévenez vos passagers pour éviter les pénalités.")
      : buildTrend("up", "Aucune pénalité active", "Excellent comportement !");

    // ── Construire histogramme simple (group by date)
    const histogramMap: Record<string, number> = {};
    for (const tx of transactions) {
      const d = new Date(tx.date).toISOString().slice(0, 10);
      histogramMap[d] = (histogramMap[d] || 0) + 1;
    }
    const histogramme = Object.keys(histogramMap).sort().map((date) => ({ date, value: histogramMap[date] }));

    // ── Scatter gain par heure (sommes par heure)
    const hourMap: Record<string, number> = {};
    for (const tx of transactions) {
      const h = String(new Date(tx.date).getHours()).padStart(2, '0');
      hourMap[h] = (hourMap[h] || 0) + tx.montant;
    }
    const scatterGainParHeure = Object.keys(hourMap).sort().map((hour) => ({ hour, montant: hourMap[hour] }));

    // ── Bank accounts via Server Core
    const bankAccounts: BankAccountResponseDto[] = bankAccountsRes.data ?? [];

    // ── Réponse ───────────────────────────────────────────────────────────
    return NextResponse.json({
      userId: auth?.userId ?? "",
      role,
      periode,
      transactions,
      histogramme,
      tendances: {
        solde: tendanceSolde,
        histogramme: buildTrend("stable", "Données via Server Core", ""),
        transactions: tendanceTransactions,
        penalites: tendancePenalites,
      },
      bankAccounts,
      driver: driverData,
      passenger: passengerData,
      scatterGainParHeure,
    });
  } catch (error) {
    console.error("[API] GET /api/finances — erreur :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
