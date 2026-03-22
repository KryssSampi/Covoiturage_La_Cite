/**
 * GET /api/vehicles   — Liste des véhicules (filtrée par driverId)
 * POST /api/vehicles  — Création d'un véhicule
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type VehicleRecord = Record<string, unknown>;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get('driverId');

    let vehicles = persistenceManager.readAll<VehicleRecord>('vehicles');
    if (driverId) vehicles = vehicles.filter((v) => v.driverId === driverId);

    return NextResponse.json(vehicles);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VehicleRecord;

    if (!body.driverId || !body.make || !body.model) {
      return NextResponse.json(
        { error: 'driverId, make et model sont requis' },
        { status: 400 }
      );
    }

    const year = new Date().getFullYear();
    const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
    const now  = new Date().toISOString();

    const newVehicle: VehicleRecord = {
      ...body,
      id: `VEH-${year}-${rand}`,
      createdAt: now,
      updatedAt: now,
    };

    persistenceManager.addItem('vehicles', newVehicle);
    return NextResponse.json(newVehicle, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
