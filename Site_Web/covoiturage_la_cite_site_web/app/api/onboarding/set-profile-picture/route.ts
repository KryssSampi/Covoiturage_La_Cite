import { NextResponse } from 'next/server';
import { OnboardingService } from '@/server/services/OnboardingService';
import { withAuth } from '@/server/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const auth = await withAuth(req);
    const result = await OnboardingService.setProfilePicture(body, auth);
    const stepResult = result.data as { success: boolean; message?: string } | undefined;
    if (!result.success || stepResult?.success === false) {
      const errMsg = stepResult?.message ?? result.message ?? 'Erreur';
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }
    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/onboarding/set-profile-picture]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
