/**
 * POST /api/admin/simulate
 * Route thin — délègue toute la logique à runSimulation → Server Core.
 * Authentification Admin obligatoire.
 * @body { tripId: string; event: SimulationEvent; params?: SimulationParams }
 */
import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import { runSimulation, VALID_EVENTS } from '@/core/services/simulation.service';
import type { SimulationEvent, SimulationParams } from '@/core/services/simulation.service';

interface SimulationBody {
  tripId:  string;
  event:   SimulationEvent;
  params?: SimulationParams;
}

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);

    // Authentification obligatoire — le Server Core vérifie le rôle Admin via JWT
    if (!auth.token) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

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

    const result = await runSimulation(
      body.tripId,
      body.event,
      body.params ?? {},
      { token: auth.token },
    );

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/admin/simulate]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
