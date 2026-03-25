/**
 * Données fictives pour la page Go! Board.
 * Aligné sur GoBoardApiResponse (nouveau format).
 */
import type { GoBoardApiResponse } from "@/features/goboard/types/goboard.types";

export const FIXTURES_GOBOARD: GoBoardApiResponse = {
  goScore: 820,
  tier: "Excellent",
  rang: 42,
  pointsGagnes: 245,
  pointsPerdus: -20,
  goTasks: [
    {
      id: "GT-001", titlefr: "Compléter votre profil", titleen: "Complete your profile",
      descriptionfr: "Photo, véhicule, préférences renseignés", descriptionen: "Photo, vehicle, preferences filled",
      category: "mixte", link: "/profile", points: 50,
      progression: [{ userId: "USR-2026-00001", isDone: true, completeAt: "2026-01-15T10:00:00.000Z" }],
    },
    {
      id: "GT-002", titlefr: "Terminer votre premier trajet avec passager", titleen: "Complete your first trip with a passenger",
      descriptionfr: "Complétez 1 trajet partagé complet", descriptionen: "Complete 1 full shared trip",
      category: "driverOnly", link: "/trajets", points: 30,
      progression: [{ userId: "USR-2026-00001", isDone: false }],
    },
    {
      id: "GT-003", titlefr: "Effectuer 3 trajets cette semaine", titleen: "Complete 3 trips this week",
      descriptionfr: "3 trajets complétés dans la même semaine", descriptionen: "3 trips completed in the same week",
      category: "mixte", link: "/trajets", points: 20,
      progression: [{ userId: "USR-2026-00001", isDone: false }],
    },
    {
      id: "GT-004", titlefr: "Inviter un ami de La Cité", titleen: "Invite a friend from La Cité",
      descriptionfr: "Votre ami doit s'inscrire avec votre lien", descriptionen: "Your friend must register with your link",
      category: "mixte", link: "/profile", points: 10,
      progression: [{ userId: "USR-2026-00001", isDone: false }],
    },
    {
      id: "GT-005", titlefr: "Laisser votre premier avis passager", titleen: "Leave your first passenger review",
      descriptionfr: "Évaluez un passager après un trajet", descriptionen: "Rate a passenger after a trip",
      category: "driverOnly", link: "/reviews", points: 15,
      progression: [{ userId: "USR-2026-00001", isDone: false }],
    },
  ],
  classement: [
    { rang: 1,  utilisateurId: "USR-2026-00004", nom: "Marie-Claude L.",  score: 980, estMoi: false },
    { rang: 2,  utilisateurId: "USR-2026-00005", nom: "Jean-Pierre M.",   score: 942, estMoi: false },
    { rang: 3,  utilisateurId: "USR-2026-00006", nom: "Sofia B.",         score: 895, estMoi: false },
    { rang: 42, utilisateurId: "USR-2026-00001", nom: "Ahmed I.",         score: 820, estMoi: true  },
  ],
  defisEco: [
    { id: "ECO-001", titre: "Éco-Débutant",  description: "Sauvez 10 kg de CO₂ en covoiturant",        cibleCO2Kg: 10,  recompense: "Badge Éco-Débutant",  progres: 100, statut: "complete" },
    { id: "ECO-002", titre: "Éco-Conscient",  description: "Économisez 50 kg de CO₂ en covoiturage",    cibleCO2Kg: 50,  recompense: "Badge Éco-Conscient", progres: 47,  statut: "actif" },
    { id: "ECO-003", titre: "Éco-Warrior",    description: "Économisez 200 kg de CO₂ — objectif ultime", cibleCO2Kg: 200, recompense: "Badge Expert Éco",    progres: 12,  statut: "verrouille" },
  ],
  goEvents: [
    { id: "GE-001", titre: "Tâche complétée : Compléter votre profil",    date: "2026-01-15T10:00:00.000Z", points: 50, utilisateurId: "USR-2026-00001" },
    { id: "GE-002", titre: "Trajet complété",                             date: "2026-03-13T08:15:00.000Z", points: 5,  utilisateurId: "USR-2026-00001" },
    { id: "GE-003", titre: "Éval. 5 étoiles — Pauline D.",                date: "2026-03-12T19:32:00.000Z", points: 10, utilisateurId: "USR-2026-00001" },
    { id: "GE-004", titre: "Badge : Ponctuel",                            date: "2026-03-12T00:00:00.000Z", points: 15, utilisateurId: "USR-2026-00001" },
    { id: "GE-005", titre: "Trajet complété x3",                          date: "2026-03-09T00:00:00.000Z", points: 15, utilisateurId: "USR-2026-00001" },
    { id: "GE-006", titre: "10 trajets consécutifs",                      date: "2026-03-05T00:00:00.000Z", points: 20, utilisateurId: "USR-2026-00001" },
    { id: "GE-007", titre: "Défi Éco-Débutant complété",                  date: "2026-01-05T00:00:00.000Z", points: 15, utilisateurId: "USR-2026-00001" },
  ],
};
