import { NextResponse } from 'next/server';
import { VehicleService } from '@/server/services/VehicleService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await VehicleService.getMyVehicles(auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const auth = await withAuth(req);

    const result = await VehicleService.create(body, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
