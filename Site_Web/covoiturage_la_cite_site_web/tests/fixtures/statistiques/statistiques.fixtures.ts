/**
 * Données fictives pour la feature Statistiques.
 * Alignées sur StatistiquesPageModel (réponse de GET /api/statistiques).
 */

import type { StatistiquesPageModel } from "@/features/statistiques/types/statistiques.types";

// ─── Données Statistiques ────────────────────────────────────────────────────

export const FIXTURES_STATISTIQUES: StatistiquesPageModel = {
  userId: "u-ahmed",
  periodeActive: "mois",
  kpis: {
    nbTrajets: { value: 32, trend: "+12 % vs période préc.", trendColor: "#0aad6a" },
    co2:       { value: 234.5, trend: "+18 % vs période préc.", trendColor: "#0aad6a" },
    note:      { value: 4.2, trend: "Stable", trendColor: "#7a90b8" },
    goScore:   { value: 820, trend: "Hyper GOoooo!", trendColor: "#c8960a", label: "Hyper GOoooo!" },
  },
  co2ParMois: [
    { mois: "Jan", kg: 128 },
    { mois: "Fév", kg: 195 },
    { mois: "Mars", kg: 234 },
    { mois: "Avr", kg: 0, isFutur: true },
    { mois: "Mai", kg: 0, isFutur: true },
  ],
  co2Total: 557.5,
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
  distributionNotes: {
    etoile1: 0,
    etoile2: 1,
    etoile3: 3,
    etoile4: 8,
    etoile5: 15,
    totalAvis: 28,
    roleLabel: "Conducteur",
    noteMoyenne: 4.2,
  },
  badges: [
    { id: "b1", nom: "Confirmé", description: "6–20 trajets", iconKey: "FaCircleCheck", iconColor: "#0aad6a", date: "Oct. 2025" },
    { id: "b2", nom: "Régulier", description: "21–50 trajets", iconKey: "FaCar", iconColor: "#08316e", date: "Jan. 2026" },
    { id: "b3", nom: "Ponctuel", description: "95% à l'heure", iconKey: "FaGaugeHigh", iconColor: "#c8960a", date: "Fév. 2026" },
    { id: "b4", nom: "Éco-Débutant", description: "50 km CO₂", iconKey: "FaSeedling", iconColor: "#0aad6a", date: "Janv. 2026" },
    { id: "b5", nom: "Fiable", description: "GoScore >800", iconKey: "FaMedal", iconColor: "#c8960a", date: "Mars 2026" },
    { id: "b6", nom: "Étudiant Cité", description: "Compte vérifié", iconKey: "FaStar", iconColor: "#08316e", date: "Oct. 2025" },
    { id: "b7", nom: "Social", description: "10 passagers ≠", iconKey: "FaShareNodes", iconColor: "#0098c8", date: "Fév. 2026" },
    { id: "b8", nom: "Expert", description: "51–100 trajets", iconKey: "FaMedal", iconColor: "#c8960a", locked: true, restant: "19 restants" },
    { id: "b9", nom: "Éco-Conscient", description: "500 km CO₂", iconKey: "FaLeaf", iconColor: "#0aad6a", locked: true, restant: "En cours" },
  ],
  badgesSummary: { obtenus: 7, total: 9 },
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
  trends: {
    co2Chart: { variant: "up", text: "CO₂ économisé en hausse de 18 % vs la période précédente." },
    scatter:  { variant: "stable", text: "Répartition distance/CO₂ stable — bonne constance." },
    notes:    { variant: "stable", text: "Note moyenne stable à 4.2/5." },
    badges:   { variant: "up", text: "7 badges obtenus sur 9 — encore 2 à décrocher !" },
    trajets:  { variant: "up", text: "12 % de trajets en plus vs la période précédente." },
    impact:   { variant: "up", text: "557.5 kg CO₂ économisés — l'équivalent de 28 arbres plantés." },
  },
};
