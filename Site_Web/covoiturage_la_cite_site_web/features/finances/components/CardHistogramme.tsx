"use client";

/**
 * CardHistogramme — enveloppe l'histogramme des revenus par semaine dans une Card.
 */

import React from "react";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import HistogramSemaines from "./HistogramSemaines";
import type { DonneesSemaine } from "../types/finances.types";

function CardHistogramme({ data }: { data: DonneesSemaine[] }) {
  return (
    <Card delay={150} className="md:col-span-2">
      <CardHeader dotColor="#08316e" title="Revenus par Semaine (Histogramme)" />
      <HistogramSemaines data={data} />
    </Card>
  );
}

export default CardHistogramme;
