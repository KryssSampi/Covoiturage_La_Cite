/**
 * POST /api/passenger/search
 *
 * La route garde uniquement l'I/O HTTP et les validations de surface.
 * Le chargement des données et l'algorithme sont délégués au core.
 */

import { NextResponse } from 'next/server';
import type { PassengerSortKey } from '@/features/search/types/search.feature.types';
import { executePassengerSearch } from '@/core/services/passenger-search.service';

interface SearchBody {
  passengerId: string;
  departureCoords?: [number, number];
  arrivalCoords?: [number, number];
  desiredHour?: number;
  /** Heure d'arrivée souhaitée (heures décimales) — déclasse sans éliminer */
  desiredArrivalHour?: number;
  desiredWeekday?: number;
  sortKey?: PassengerSortKey;
  maxPrice?: number;
  minSeatsAvailable?: number;
  departureRadiusMeters?: number;
  arrivalRadiusMeters?: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SearchBody;

    if (!body.passengerId) {
      return NextResponse.json({ error: 'passengerId est requis' }, { status: 400 });
    }

    const result = executePassengerSearch(body);
    if (!result) {
      return NextResponse.json({ error: 'Passager introuvable' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/passenger/search]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
