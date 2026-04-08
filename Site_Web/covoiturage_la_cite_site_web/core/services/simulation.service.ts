/**
 * core/services/simulation.service.ts
 *
 * Délègue toute la logique de simulation au Server Core via AdminService.
 * L'authentification + rôle Admin sont vérifiés dans la route BFF.
 */

import { AdminService, type SimulateEventResultDto } from '@/server/services/AdminService';
import type { RequestOptions } from '@/server/http-client';

// ── Types publics ─────────────────────────────────────────────────────────────

export type SimulationEvent =
  | 'retard_15_30'
  | 'retard_30_60'
  | 'retard_60plus'
  | 'annulation_conducteur'
  | 'no_show_conducteur'
  | 'no_show_passager'
  | 'trajet_complete'
  | 'litige'
  | 'accident';

export interface SimulationParams {
  reservationId?: string;
}

export interface SimulationResult {
  success:              boolean;
  event:                SimulationEvent;
  tripId:               string;
  message:              string;
  penalite:             { montant: number; pointsReputation: number; suspension?: string } | null;
  affectedReservations: number;
}

export type SimulationError = { error: string; status: number };

export const VALID_EVENTS: SimulationEvent[] = [
  'retard_15_30', 'retard_30_60', 'retard_60plus',
  'annulation_conducteur', 'no_show_conducteur', 'no_show_passager',
  'trajet_complete', 'litige', 'accident',
];

// ── runSimulation ─────────────────────────────────────────────────────────────

export async function runSimulation(
  tripId:  string,
  event:   SimulationEvent,
  params:  SimulationParams = {},
  options?: RequestOptions,
): Promise<SimulationResult | SimulationError> {

  const res = await AdminService.simulateEvent(
    { tripId, event, reservationId: params.reservationId },
    options,
  );

  if (!res.success || !res.data) {
    return { error: res.message ?? 'Erreur simulation', status: 400 };
  }

  const d: SimulateEventResultDto = res.data;

  return {
    success:              d.success,
    event:                d.event as SimulationEvent,
    tripId:               d.tripId,
    message:              d.message,
    penalite:             d.penalite,
    affectedReservations: d.affectedReservations,
  };
}
