/**
 * @file finance.fixtures.ts
 * @description Données de test pour FinanceSection (conducteur).
 * ⚠️ DÉVELOPPEMENT UNIQUEMENT — À remplacer par un appel API.
 *
 * TODO: GET /api/driver/{userId}/finance/summary
 *   Retourne les gains mensuels, hebdomadaires, en transit et pénalités actives.
 *   Aligne sur §7 (Paiement Simulé) du manifeste.
 */

import { DriverFinanceSummary } from "@/features/dashboard/types/financesummary.types";

export const FIXTURE_DRIVER_FINANCE: DriverFinanceSummary = {
  id: 1,
  soldeDisponible: 150.75,
  currency: "CAD",
  weeklyProfit: 35.50,
  weeklyPendingProfit: 20.00,
  penalties: 13.75,
};
