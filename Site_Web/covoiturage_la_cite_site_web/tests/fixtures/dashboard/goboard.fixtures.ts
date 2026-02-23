/**
 * @file goboard.fixtures.ts
 * @description Données de test pour GoBoard (tâches de gamification).
 * ⚠️ DÉVELOPPEMENT UNIQUEMENT — À remplacer par un appel API.
 *
 * TODO: GET /api/users/{userId}/go-tasks
 */

import { GoTask } from "@/features/dashboard/types/goboard.types";

export const FIXTURE_GO_TASKS: GoTask[] = [
  {
    id: 1,
    titlefr: "Compléter votre profil",
    titleen: "Complete your profile",
    descriptionfr:
      "Ajoutez une photo de profil, une bio et vos préférences de covoiturage pour aider les autres à mieux vous connaître.",
    descriptionen:
      "Add a profile picture, bio, and carpooling preferences to help others get to know you better.",
    isCompleted: true,
    link: "/profile",
    points: 50,
  },
  {
    id: 2,
    titlefr: "Terminer votre premier trajet",
    titleen: "Complete your first ride",
    descriptionfr:
      "Effectuez votre premier trajet en tant que passager ou conducteur pour gagner des points et débloquer de nouvelles fonctionnalités.",
    descriptionen:
      "Complete your first ride as a passenger or driver to earn points and unlock new features.",
    isCompleted: false,
    link: "/trajets",
    points: 30,
  },
  {
    id: 3,
    titlefr: "Effectuer 3 trajets cette semaine",
    titleen: "Complete 3 rides this week",
    descriptionfr:
      "Participez à au moins 3 trajets cette semaine pour montrer votre engagement envers le covoiturage et gagner des points supplémentaires.",
    descriptionen:
      "Participate in at least 3 rides this week to show your commitment to carpooling and earn extra points.",
    isCompleted: false,
    link: "/trajets",
    points: 20,
  },
  {
    id: 4,
    titlefr: "Inviter un ami de La Cité à rejoindre",
    titleen: "Invite a friend from La Cité to join",
    descriptionfr:
      "Partagez votre lien d'invitation avec un ami de La Cité pour l'encourager à rejoindre la plateforme et gagner des points lorsque votre ami s'inscrit.",
    descriptionen:
      "Share your referral link with a friend from La Cité to encourage them to join the platform and earn points when your friend signs up.",
    isCompleted: false,
    link: "/invite",
    points: 10,
  },
  {
    id: 5,
    titlefr: "Partager votre trajet sur les réseaux sociaux",
    titleen: "Share your ride on social media",
    descriptionfr:
      "Partagez votre trajet sur les réseaux sociaux pour encourager vos amis à rejoindre la plateforme et gagner des points supplémentaires.",
    descriptionen:
      "Share your ride on social media to encourage your friends to join the platform and earn extra points.",
    isCompleted: false,
    link: "/share",
    points: 5,
  },
  {
    id: 6,
    titlefr: "Laisser votre premier avis après un trajet",
    titleen: "Leave your first review after a ride",
    descriptionfr:
      "Laissez votre premier avis après un trajet pour aider les autres utilisateurs à prendre des décisions éclairées et gagner des points.",
    descriptionen:
      "Leave your first review after a ride to help other users make informed decisions and earn points.",
    isCompleted: false,
    link: "/reviews",
    points: 15,
  },
  {
    id: 7,
    titlefr: "Participer à un événement de covoiturage de La Cité",
    titleen: "Attend a La Cité carpooling event",
    descriptionfr:
      "Participez à un événement de covoiturage organisé par La Cité pour rencontrer d'autres utilisateurs et gagner des points.",
    descriptionen:
      "Attend a carpooling event organized by La Cité to meet other users and earn points.",
    isCompleted: false,
    link: "/events",
    points: 25,
  },
  {
    id: 8,
    titlefr: "Atteindre un score de 500 points",
    titleen: "Reach a score of 500 points",
    descriptionfr:
      "Accumulez 500 points en complétant des tâches et en participant à des trajets pour débloquer de nouvelles fonctionnalités et avantages sur la plateforme.",
    descriptionen:
      "Accumulate 500 points by completing tasks and participating in rides to unlock new features and benefits on the platform.",
    isCompleted: true,
    link: "/goboard",
    points: 40,
  },
  {
    id: 9,
    titlefr: "Atteindre un score de 1000 points",
    titleen: "Reach a score of 1000 points",
    descriptionfr:
      "Accumulez 1000 points en complétant des tâches et en participant à des trajets pour débloquer de nouvelles fonctionnalités et avantages sur la plateforme.",
    descriptionen:
      "Accumulate 1000 points by completing tasks and participating in rides to unlock new features and benefits on the platform.",
    isCompleted: false,
    link: "/goboard",
    points: 100,
  },
];
