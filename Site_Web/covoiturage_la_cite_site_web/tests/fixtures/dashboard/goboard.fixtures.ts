/**
 * @file goboard.fixtures.ts
 * @description Données de test pour GoBoard (tâches de gamification).
 * ⚠️ OBSOLÈTE — Les GoTasks sont maintenant servies via SSE depuis gotasks.json.
 *   Ce fichier est conservé pour référence uniquement.
 */

import { GoTask } from "@/features/dashboard/types/goboard.types";

export const FIXTURE_GO_TASKS: GoTask[] = [
  {
    id: "GT-001",
    titlefr: "Compléter votre profil",
    titleen: "Complete your profile",
    descriptionfr: "Ajoutez une photo de profil, une bio et vos préférences de covoiturage.",
    descriptionen: "Add a profile picture, bio, and carpooling preferences.",
    category: "mixte",
    link: "/profile",
    points: 50,
    progression: [],
  },
];
