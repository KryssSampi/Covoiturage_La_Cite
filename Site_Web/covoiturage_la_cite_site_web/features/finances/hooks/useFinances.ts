/**
 * Hook pour la page Mes Finances.
 * Calcule les données financières depuis la base JSON (useDb).
 */
"use client";

import { useState, useMemo } from "react";
import { useDb } from "@/core/context/db.context";
import { useAppState } from "@/core/state/app_state";
import type { PeriodeFinance } from "@/features/finances/types/finances.types";

const PERIODES: PeriodeFinance[] = ["7j", "mois", "3mois", "tout"];

export function useFinances() {
  const [periode, setPeriode] = useState<PeriodeFinance>("mois");
  const { myTrips, myReservations } = useDb();
  const { userConnected } = useAppState();

  // ── Trajets complétés comme conducteur ────────────────────────────────────
  const completedDriverTrips = useMemo(
    () => myTrips.filter((t) => t.status === "completed" && t.driverId === userConnected?.id),
    [myTrips, userConnected?.id],
  );

  // ── Réservations confirmées/complétées comme passager ─────────────────────
  const completedPassengerReservations = useMemo(
    () => myReservations.filter(
      (r) => (r.status === "completed" || r.status === "confirmed") &&
              r.passengerId === userConnected?.id,
    ),
    [myReservations, userConnected?.id],
  );

  // ── Revenus / dépenses ────────────────────────────────────────────────────
  const revenuBrut = useMemo(
    () => completedDriverTrips.reduce((acc, t) => {
      const passagers = t.currentPassengers;
      return acc + t.pricePerPassenger * passagers;
    }, 0),
    [completedDriverTrips],
  );
  const commission     = 0.10; // 10 % de commission
  const revenuNet      = Math.round(revenuBrut * (1 - commission) * 100) / 100;
  const revenuMensuel  = revenuNet;
  const objectifMensuel = 200;

  const nbTrajetsPayants = completedDriverTrips.filter(
    (t) => t.pricePerPassenger > 0,
  ).length;

  // ── Transactions simplifiées (5 derniers trajets conducteur) ──────────────
  const transactions = useMemo(
    () => completedDriverTrips.slice(-5).map((t) => {
      const passagers = t.currentPassengers;
      const montant   = Math.round(t.pricePerPassenger * passagers * (1 - commission) * 100) / 100;
      return {
        id:          t.id,
        type:        "revenu"   as const,
        montant,
        description: `${t.departure.label} → ${t.arrival.label}`,
        date:        new Date(t.departureDate),
        trajetId:    t.id,
        nbPassagers: passagers,
        statut:      "confirme" as const,
      };
    }),
    [completedDriverTrips],
  );

  // ── Pas de pénalités dans les données actuelles ───────────────────────────
  const penalitesActives:  never[] = [];
  const historiqueParSemaine: { semaine: string; revenusBruts: number; penalites: number; nbTrajets: number }[] = [];
  const scatterGainParHeure: never[] = [];

  return {
    periode,
    setPeriode,
    periodes:          PERIODES,
    soldeDisponible:   revenuNet,
    soldeTransit:      0,
    penalitesTotal:    0,
    revenuMensuel,
    objectifMensuel,
    commission:        Math.round(revenuBrut * commission * 100) / 100,
    nbTrajetsPayants,
    transactions,
    penalitesActives,
    historiqueParSemaine,
    scatterGainParHeure,
    ibanMasque:        "****",
    completedPassengerReservations,
  };
}
