import { NextResponse } from 'next/server';
import { RoutingService } from '@/server/services/RoutingService';

export async function POST(req: Request) {
  try {
    const { dep, arr, mode = 'simple', depLabel = 'Départ', arrLabel = 'Arrivée' } = await req.json() as {
      dep:       [number, number];
      arr:       [number, number];
      mode?:     'simple' | 'circuits';
      depLabel?: string;
      arrLabel?: string;
    };

    if (!dep || !arr || dep.length < 2 || arr.length < 2)
      return NextResponse.json({ error: 'dep et arr requis ([lng, lat])' }, { status: 400 });

    if (mode === 'circuits') {
      const circuits = await RoutingService.getCircuits(dep, arr, depLabel, arrLabel);
      return NextResponse.json({ circuits });
    }

    const route = await RoutingService.getSimpleRoute(dep, arr);
    return NextResponse.json({ route });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur routing';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
