"use client";

/**
 * CardHistogramme — enveloppe l'histogramme dans une Card avec titre dynamique selon le rôle et la période.
 * Composant de présentation pure : toutes les données viennent des props.
 */

import React from "react";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import HistogramSemaines from "./HistogramSemaines";
import type { DonneesHistogramme, TrendMessage, PeriodeFinance } from "../types/finances.types";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface CardHistogrammeProps {
  data: DonneesHistogramme[];
  role: "driver" | "passenger";
  periode: PeriodeFinance;
  tendance: TrendMessage;
}

// ─── Titre dynamique selon le rôle et la période ────────────────────────────

const PERIODE_LABELS: Record<PeriodeFinance, string> = {
  "7j": "7 derniers jours",
  mois: "Mois en cours",
  "3mois": "3 derniers mois",
  tout: "Toutes les données",
};

function getHistogrammeTitle(role: "driver" | "passenger", periode: PeriodeFinance): string {
  const sujet = role === "driver" ? "Revenus" : "Dépenses";
  return `${sujet} — ${PERIODE_LABELS[periode]}`;
}

// ─── Composant ──────────────────────────────────────────────────────────────

function CardHistogramme({ data, role, periode, tendance }: CardHistogrammeProps) {
  return (
    <Card delay={150} className="md:col-span-2 w-full h-full min-h-[40vh] flex flex-col ">
      <CardHeader dotColor="#08316e" title={getHistogrammeTitle(role, periode)} />
      <HistogramSemaines data={data} tendance={tendance} role={role} />
    </Card>
  );
}

export default CardHistogramme;
