/**
 * Données fictives pour la feature Statistiques.
 * KPIs, CO2, notes, badges, trajets récents et impact écologique.
 */

import type { StatistiquesPageModel } from "@/features/statistiques/types/statistiques.types";

// ─── Données Statistiques ────────────────────────────────────────────────────

export const FIXTURES_STATISTIQUES: StatistiquesPageModel = {
  utilisateurId: "u-ahmed",
  periodeActive: "mois",
  kpis: { nbTrajets: 32, co2Mois: 234.5, noteMoyenne: 4.2, goScore: 820 },
  statsTrajets: {
    conducteur: 28,
    passager: 4,
    totalKm: 1248,
    dureeMoyenneMin: 22,
    annulations: 1,
    ponctualite: 96,
    passagersUniques: 14,
    gainNet: 312.5,
  },
  co2ParMois: [
    { mois: "Jan", kg: 128 },
    { mois: "Fév", kg: 195 },
    { mois: "Mars", kg: 234 },
    { mois: "Avr", kg: 0, isFutur: true },
    { mois: "Mai", kg: 0, isFutur: true },
  ],
  scatterCO2Distance: [
    { distanceKm: 8, co2Kg: 3.6, categorie: "courte" },
    { distanceKm: 10, co2Kg: 4.5, categorie: "courte" },
    { distanceKm: 12, co2Kg: 5.4, categorie: "courte" },
    { distanceKm: 14, co2Kg: 6.3, categorie: "courte" },
    { distanceKm: 16, co2Kg: 8.4, categorie: "moyenne" },
    { distanceKm: 18, co2Kg: 9.9, categorie: "moyenne" },
    { distanceKm: 19, co2Kg: 10.8, categorie: "moyenne" },
    { distanceKm: 21, co2Kg: 12.0, categorie: "moyenne" },
    { distanceKm: 22, co2Kg: 13.2, categorie: "longue" },
    { distanceKm: 25, co2Kg: 15.0, categorie: "longue" },
    { distanceKm: 28, co2Kg: 16.8, categorie: "longue" },
    { distanceKm: 32, co2Kg: 19.2, categorie: "longue" },
  ],
  notesParSemaine: [
    { semaine: "S7 fév", notes: [5, 5, 4], mediane: 5 },
    { semaine: "S8 fév", notes: [5, 4, 5], mediane: 5 },
    { semaine: "S9 mars", notes: [4, 3, 4], mediane: 4 },
    { semaine: "S10 mars", notes: [5, 5, 5, 4], mediane: 5 },
    { semaine: "S11 mars", notes: [5, 4], mediane: 4.5 },
  ],
  distributionNotes: [0, 1, 1, 3, 8, 15],
  badgesObtenus: [
    { id: "b1", nom: "Confirmé", description: "6–20 trajets", date: "Oct. 2025" },
    { id: "b2", nom: "Régulier", description: "21–50 trajets", date: "Jan. 2026" },
    { id: "b3", nom: "Ponctuel", description: "95% à l'heure", date: "Fév. 2026" },
    { id: "b4", nom: "Éco-Débutant", description: "50 km CO₂", date: "Janv. 2026" },
    { id: "b5", nom: "Fiable", description: "GoScore >800", date: "Mars 2026" },
    { id: "b6", nom: "Étudiant Cité", description: "Compte vérifié", date: "Oct. 2025" },
    { id: "b7", nom: "Social", description: "10 passagers ≠", date: "Fév. 2026" },
    { id: "b8", nom: "Expert", description: "51–100 trajets", locked: true, restant: "19 restants" },
    { id: "b9", nom: "Éco-Conscient", description: "500 km CO₂", locked: true, restant: "En cours" },
  ],
  derniersTrajetsSummary: [
    { id: "t1", route: { depart: "Ottawa", arrivee: "Campus La Cité" }, date: "Auj. 08h15", nbPassagers: 1, distanceKm: 12, gainNet: 17, co2EconomiseKg: 8.4, noteRecue: 5, statut: "complete" },
    { id: "t2", route: { depart: "Campus", arrivee: "Vanier" }, date: "Hier 17h", nbPassagers: 2, distanceKm: 9, gainNet: 34, co2EconomiseKg: 12.6, noteRecue: 4, statut: "complete" },
    { id: "t3", route: { depart: "Gatineau", arrivee: "Campus" }, date: "11 mars", nbPassagers: 1, distanceKm: 18, gainNet: 20, co2EconomiseKg: 12.6, noteRecue: 5, statut: "complete" },
    { id: "t4", route: { depart: "Ottawa", arrivee: "Montréal" }, date: "8 mars", nbPassagers: 0, distanceKm: 200, gainNet: -8.75, co2EconomiseKg: 0, statut: "annule" },
    { id: "t5", route: { depart: "Orléans", arrivee: "Campus" }, date: "7 mars", nbPassagers: 1, distanceKm: 22, gainNet: 22, co2EconomiseKg: 15.4, noteRecue: 5, statut: "complete" },
  ],
  impactEco: {
    co2TotalKg: 557.5,
    kmTotaux: 1248,
    carburantLitres: 219,
    arbresEquivalents: 28,
    voituresEvitees: 47,
    economiesDollars: 412,
  },
};
