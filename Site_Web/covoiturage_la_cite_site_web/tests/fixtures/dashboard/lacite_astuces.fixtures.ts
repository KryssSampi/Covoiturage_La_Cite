/**
 * @file lacite_astuces.fixtures.ts
 * @description Données de test pour le carrousel d'astuces La Cité.
 * ⚠️ OBSOLÈTE — Les astuces sont maintenant servies depuis tests/db/astuces.json via /api/astuces.
 *   Ce fichier est conservé pour référence uniquement.
 */

import { Tip } from "@/features/dashboard/types/lacite_astuces.types";

export const LACITE_TIPS: Tip[] = [
  {
    id: "TIP-001",
    src: "/img/astuces.lacite/plan-early.png",
    titlefr: "Planifiez à l'avance",
    titleen: "Plan Ahead",
    descriptionfr:
      "Réservez votre trajet à l'avance pour garantir votre place et bénéficier de tarifs avantageux.",
    descriptionen:
      "Book your trip in advance to secure your spot and benefit from advantageous rates.",
  },
];
