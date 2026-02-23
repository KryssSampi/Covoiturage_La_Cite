/**
 * @file lacite_astuces.fixtures.ts
 * @description Données statiques pour le carrousel d'astuces La Cité.
 * Ces données sont éditoriales et non liées à une API — peuvent rester en dur.
 */

import { Tip } from "@/features/dashboard/types/lacite_astuces.types";

export const LACITE_TIPS: Tip[] = [
  {
    id: 1,
    src: "/img/astuces.lacite/plan-early.png",
    titlefr: "Planifiez à l'avance",
    titleen: "Plan Ahead",
    descriptionfr:
      "Réservez votre trajet à l'avance pour garantir votre place et bénéficier de tarifs avantageux.",
    descriptionen:
      "Book your trip in advance to secure your spot and benefit from advantageous rates.",
  },
  {
    id: 2,
    src: "/img/astuces.lacite/be-punctual.png",
    titlefr: "Soyez ponctuel",
    titleen: "Be Punctual",
    descriptionfr:
      "Arrivez à l'heure au point de rendez-vous pour éviter les retards et les désagréments.",
    descriptionen:
      "Arrive on time at the meeting point to avoid delays and inconveniences.",
  },
  {
    id: 3,
    src: "/img/astuces.lacite/communicate-with-driver.png",
    titlefr: "Communiquez avec votre conducteur",
    titleen: "Communicate with Your Driver",
    descriptionfr:
      "N'hésitez pas à contacter votre conducteur pour toute question ou besoin particulier.",
    descriptionen:
      "Don't hesitate to contact your driver for any questions or special needs.",
  },
  {
    id: 4,
    src: "/img/astuces.lacite/share-yours-experiences.png",
    titlefr: "Partagez vos expériences",
    titleen: "Share Your Experiences",
    descriptionfr:
      "Laissez des avis et partagez vos expériences pour aider la communauté à s'améliorer.",
    descriptionen:
      "Leave reviews and share your experiences to help the community improve.",
  },
];
