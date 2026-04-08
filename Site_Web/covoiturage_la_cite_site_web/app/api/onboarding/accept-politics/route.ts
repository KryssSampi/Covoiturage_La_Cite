import { NextResponse } from 'next/server';
import { OnboardingService } from '@/server/services/OnboardingService';
import { withAuth } from '@/server/auth';

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await OnboardingService.acceptPolitics(auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/onboarding/accept-politics]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
