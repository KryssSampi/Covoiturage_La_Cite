import { NextResponse } from 'next/server';
import { queryAdminTrips } from '@/core/services/admin-api.service';

export async function GET() {
  try {
    return NextResponse.json(queryAdminTrips());
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
