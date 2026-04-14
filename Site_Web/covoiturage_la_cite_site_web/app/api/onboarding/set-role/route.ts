import { NextResponse } from 'next/server';
import { OnboardingService } from '@/server/services/OnboardingService';
import { withAuth } from '@/server/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const auth = await withAuth(req);
    const result = await OnboardingService.setRole(body, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/onboarding/set-role]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
