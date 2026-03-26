/**
 * POST /api/admin/simulate
 * Route thin — délègue toute la logique à runSimulation.
 * @body { tripId: string; event: SimulationEvent; params?: SimulationParams }
 */
import { NextResponse } from 'next/server';
import { runSimulation, VALID_EVENTS } from '@/core/services/simulation.service';
import type { SimulationEvent, SimulationParams } from '@/core/services/simulation.service';

interface SimulationBody {
  tripId:  string;
  event:   SimulationEvent;
  params?: SimulationParams;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<SimulationBody>;

    if (!body.tripId || !body.event) {
      return NextResponse.json({ error: 'Paramètres tripId et event requis' }, { status: 400 });
    }
    if (!VALID_EVENTS.includes(body.event as SimulationEvent)) {
      return NextResponse.json(
        { error: `Événement invalide. Valeurs acceptées : ${VALID_EVENTS.join(', ')}` },
        { status: 400 }
      );
    }

    const result = runSimulation(body.tripId, body.event, body.params ?? {});

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
