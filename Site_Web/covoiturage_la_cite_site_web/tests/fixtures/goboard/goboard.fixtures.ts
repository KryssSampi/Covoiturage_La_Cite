/**
 * Données fictives pour la page Go! Board.
 */
import type { GoBoardPageModel } from "@/features/goboard/types/goboard.types";

export const FIXTURES_GOBOARD: GoBoardPageModel = {
  utilisateurId: "ahmed-ibrahim",
  goScore: 820,
  goScoreLabel: "Hyper GOoooo!",
  tier: "Excellent",
  rang: 42,
  pointsGagnes: 245,
  pointsPerdus: -20,
  progressionScatter: [],
  missions: [
    { id: "m1", titre: "Compléter votre profil",                     description: "Photo, véhicule, préférences renseignés",              pointsRecompense: 50, progres: 1, objectif: 1, estCompletee: true  },
    { id: "m2", titre: "Terminer votre premier trajet avec passager", description: "Complétez 1 trajet partagé complet",                   pointsRecompense: 30, progres: 0, objectif: 1, estCompletee: false },
    { id: "m3", titre: "Effectuer 3 trajets cette semaine",           description: "3 trajets complétés dans la même semaine",             pointsRecompense: 20, progres: 2, objectif: 3, estCompletee: false },
    { id: "m4", titre: "Inviter un ami de La Cité",                   description: "Votre ami doit s\u0027inscrire avec votre lien",       pointsRecompense: 10, progres: 0, objectif: 1, estCompletee: false },
    { id: "m5", titre: "Partager votre trajet sur les réseaux",       description: "Publiez sur Facebook ou Instagram",                    pointsRecompense:  5, progres: 0, objectif: 1, estCompletee: false },
    { id: "m6", titre: "Laisser votre premier avis passager",         description: "Évaluez un passager après un trajet",                  pointsRecompense: 15, progres: 0, objectif: 1, estCompletee: false },
  ],
  classement: [
    { rang: 1,  utilisateurId: "mcl", nom: "Marie-Claude L.",  score: 980, nbTrajets: 28, note: 4.9, estMoi: false },
    { rang: 2,  utilisateurId: "jpm", nom: "Jean-Pierre M.",   score: 942, nbTrajets: 24, note: 4.8, estMoi: false },
    { rang: 3,  utilisateurId: "sb",  nom: "Sofia B.",         score: 895, nbTrajets: 21, note: 4.9, estMoi: false },
    { rang: 42, utilisateurId: "ai",  nom: "Ahmed I.",         score: 820, nbTrajets: 14, note: 4.9, estMoi: true  },
  ],
  defisEco: [
    { id: "d1", nom: "Éco-Conscient", cible: "Économiser 500 km de CO₂ en covoiturage",   progres: 47,  statut: "actif",      recompense: "Badge + email félicitations" },
    { id: "d2", nom: "Éco-Warrior",   cible: "Économiser 1 000 km de CO₂ total",          progres: 23,  statut: "verrouille", recompense: "Badge Expert Éco" },
    { id: "d3", nom: "Éco-Débutant",  cible: "50 km économisés — obtenu le 5 janv. 2026", progres: 100, statut: "complete",   recompense: "Complété" },
  ],
  historiquePts: [
    { label: "Trajet complété",        pts: 5,  signe: "+", date: new Date("2026-03-13T08:15:00") },
    { label: "Éval. 5★ — Pauline D.",  pts: 10, signe: "+", date: new Date("2026-03-12T19:32:00") },
    { label: "Badge : Ponctuel",       pts: 15, signe: "+", date: new Date("2026-03-12T00:00:00") },
    { label: "Retard 18 min",          pts: 10, signe: "-", date: new Date("2026-03-10T08:30:00") },
    { label: "Trajets ×3",            pts: 15, signe: "+", date: new Date("2026-03-09T00:00:00") },
    { label: "Annulation <24h",        pts: 15, signe: "-", date: new Date("2026-03-08T00:00:00") },
    { label: "Éval. 5★ ×2",           pts: 20, signe: "+", date: new Date("2026-03-07T00:00:00") },
    { label: "10 trajets consécutifs", pts: 20, signe: "+", date: new Date("2026-03-05T00:00:00") },
    { label: "Défi Éco-Débutant",      pts: 15, signe: "+", date: new Date("2026-01-05T00:00:00") },
  ],
};
