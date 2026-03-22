/**
 * Hook de gestion des données Statistiques.
 * Calcule les KPIs depuis la base JSON (useDb) au lieu des fixtures.
 */
"use client";

import { useState, useMemo } from "react";
import { useDb } from "@/core/context/db.context";
import { useAppState } from "@/core/state/app_state";
import type { Periode, TrajetResume } from "../types/statistiques.types";

const PERIODES: Periode[] = ["7j", "mois", "3mois", "6mois", "tout"];
const MOIS_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
                     "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export function useStatistiques() {
  const [periode, setPeriode] = useState<Periode>("mois");
  const { myTrips, myReviews, users } = useDb();
  const { userConnected } = useAppState();

  // Profil complet depuis la base JSON (core/models, pas domain/models)
  const userProfile = users.find((u) => u.id === userConnected?.id);

  const completedTrips = useMemo(
    () => myTrips.filter((t) => t.status === "completed"),
    [myTrips],
  );

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const co2 = (userProfile?.driverProfile?.co2SavedKg ?? 0) +
                (userProfile?.passengerProfile?.co2SavedKg ?? 0);
    const note = userProfile?.driverProfile?.averageRating ??
                 userProfile?.passengerProfile?.averageRating ?? 0;
    return {
      nbTrajets:    completedTrips.length,
      co2Mois:      Math.round(co2 * 10) / 10,
      noteMoyenne:  Math.round(note * 10) / 10,
      goScore:      userProfile?.goScore ?? 0,
    };
  }, [completedTrips, userProfile]);

  // ── CO2 par mois ──────────────────────────────────────────────────────────
  const co2ParMois = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const co2Total = kpis.co2Mois;
    const perMonth  = currentMonth > 0 ? Math.round(co2Total / currentMonth) : 0;
    return MOIS_LABELS.map((mois, idx) => ({
      mois,
      kg:       idx < currentMonth ? perMonth : 0,
      isFutur:  idx > currentMonth,
    }));
  }, [kpis.co2Mois]);

  // ── Scatter CO2/distance ──────────────────────────────────────────────────
  const scatterCO2Distance = useMemo(() =>
    completedTrips.map((t) => {
      const dist = t.estimatedDistanceKm ?? 0;
      return {
        distanceKm: dist,
        co2Kg:      Math.round(dist * 0.21 * 10) / 10,
        categorie:  dist < 20 ? "courte" : dist < 60 ? "moyenne" : "longue",
      };
    }),
    [completedTrips],
  ) as import("../types/statistiques.types").DataPointCO2Distance[];

  // ── Notes par semaine (4 dernières semaines) ──────────────────────────────
  const notesParSemaine = useMemo(() => {
    const now    = Date.now();
    const weeks  = [3, 2, 1, 0].map((offset) => {
      const start = now - (offset + 1) * 7 * 86400_000;
      const end   = now - offset       * 7 * 86400_000;
      const notes = myReviews
        .filter((r) => {
          const t = new Date(r.createdAt).getTime();
          return t >= start && t < end;
        })
        .map((r) => r.rating);
      const mediane = notes.length
        ? notes.reduce((a, b) => a + b, 0) / notes.length
        : 0;
      return { semaine: `S${4 - offset}`, notes, mediane: Math.round(mediane * 10) / 10 };
    });
    return weeks;
  }, [myReviews]);

  // ── Badges ────────────────────────────────────────────────────────────────
  const badgesObtenus = useMemo(() => {
    const ids = userProfile?.badgeIds ?? [];
    // Noms simplifiés basés sur l'ID
    return ids.map((id: string, i: number) => ({ id, nom: `Badge ${i + 1}`, description: "" }));
  }, [userProfile?.badgeIds]);

  // ── Derniers trajets résumés ──────────────────────────────────────────────
  const derniersTrajetsSummary = useMemo<TrajetResume[]>(() =>
    completedTrips.slice(-5).map((t) => ({
      id:             t.id,
      route:          { depart: t.departure.label, arrivee: t.arrival.label },
      date:           t.departureDate,
      nbPassagers:    t.currentPassengers,
      distanceKm:     t.estimatedDistanceKm ?? 0,
      gainNet:        t.pricePerPassenger * t.currentPassengers,
      co2EconomiseKg: Math.round((t.estimatedDistanceKm ?? 0) * 0.21 * 10) / 10,
      statut:         "complete" as const,
    })),
    [completedTrips],
  );

  // ── Impact écologique ─────────────────────────────────────────────────────
  const impactEco = useMemo(() => {
    const kmTotaux = completedTrips.reduce((acc, t) => acc + (t.estimatedDistanceKm ?? 0), 0);
    const co2Total = kpis.co2Mois;
    return {
      co2TotalKg:        co2Total,
      kmTotaux,
      carburantLitres:   Math.round(co2Total / 2.3),
      arbresEquivalents: Math.round(co2Total / 20),
      voituresEvitees:   Math.round(co2Total / 180),
      economiesDollars:  Math.round(kmTotaux * 0.12),
    };
  }, [kpis.co2Mois, completedTrips]);

  return {
    periode,
    setPeriode,
    periodes: PERIODES,
    kpis,
    co2ParMois,
    scatterCO2Distance,
    notesParSemaine,
    badgesObtenus,
    derniersTrajetsSummary,
    impactEco,
  };
}
