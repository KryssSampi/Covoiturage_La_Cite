import { NextResponse } from 'next/server';
import { buildVehicleRecord, queryVehicles, type VehiclePayload } from '@/core/services/vehicle-api.service';
import { persistenceManager } from '@/tests/PersistenceManager';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get('driverId');
    return NextResponse.json(queryVehicles(driverId));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VehiclePayload;
    const { vehicle, error, status } = buildVehicleRecord(body);

    if (!vehicle) {
      return NextResponse.json({ error }, { status: status ?? 400 });
    }

    persistenceManager.addItem('vehicles', vehicle);
    return NextResponse.json(vehicle, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
