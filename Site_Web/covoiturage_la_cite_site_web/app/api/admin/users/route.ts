import { NextResponse } from 'next/server';
import { queryAdminUsers } from '@/core/services/admin-api.service';

export async function GET() {
  try {
    return NextResponse.json(queryAdminUsers());
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
