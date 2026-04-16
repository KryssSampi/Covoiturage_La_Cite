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
      id: "GT-001", taskKey: "complete_profile", titleFr: "Compléter votre profil", titleEn: "Complete your profile",
      descriptionFr: "Photo, véhicule, préférences renseignés", descriptionEn: "Photo, vehicle, preferences filled",
      category: "mixte", link: "/profile", points: 50, isCompleted: true,
      progression: [{ userId: "USR-2026-00001", isDone: true, completeAt: "2026-01-15T10:00:00.000Z" }],
    },
    {
      id: "GT-002", taskKey: "first_trip_with_passenger", titleFr: "Terminer votre premier trajet avec passager", titleEn: "Complete your first trip with a passenger",
      descriptionFr: "Complétez 1 trajet partagé complet", descriptionEn: "Complete 1 full shared trip",
      category: "driverOnly", link: "/trajets", points: 30, isCompleted: false,
      progression: [{ userId: "USR-2026-00001", isDone: false }],
    },
    {
      id: "GT-003", taskKey: "three_trips_this_week", titleFr: "Effectuer 3 trajets cette semaine", titleEn: "Complete 3 trips this week",
      descriptionFr: "3 trajets complétés dans la même semaine", descriptionEn: "3 trips completed in the same week",
      category: "mixte", link: "/trajets", points: 20, isCompleted: false,
      progression: [{ userId: "USR-2026-00001", isDone: false }],
    },
    {
      id: "GT-004", taskKey: "invite_friend", titleFr: "Inviter un ami de La Cité", titleEn: "Invite a friend from La Cité",
      descriptionFr: "Votre ami doit s'inscrire avec votre lien", descriptionEn: "Your friend must register with your link",
      category: "mixte", link: "/profile", points: 10, isCompleted: false,
      progression: [{ userId: "USR-2026-00001", isDone: false }],
    },
    {
      id: "GT-005", taskKey: "first_passenger_review", titleFr: "Laisser votre premier avis passager", titleEn: "Leave your first passenger review",
      descriptionFr: "Évaluez un passager après un trajet", descriptionEn: "Rate a passenger after a trip",
      category: "driverOnly", link: "/reviews", points: 15, isCompleted: false,
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
