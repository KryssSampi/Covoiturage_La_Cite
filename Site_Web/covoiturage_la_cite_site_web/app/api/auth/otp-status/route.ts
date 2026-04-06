import { NextResponse } from 'next/server';
import { AuthSessionService } from '@/server/services/AuthSessionService';
import { getAuthSessionKey } from '@/server/auth';

/**
 * GET /api/auth/otp-status
 * Retourne le statut OTP (expiration, dernier envoi, resends restants)
 */
export async function GET() {
  try {
    const authSessionKey = await getAuthSessionKey();
    // Debug log (ne pas imprimer la valeur du cookie)
    console.log('[otp-status] authSessionKey present?', !!authSessionKey);
    if (!authSessionKey) {
      return NextResponse.json({ error: 'Session manquante. Rechargez la page.', debug: { hasAuthSessionKey: false } }, { status: 401 });
    }

    const { json, status } = await AuthSessionService.otpStatus(authSessionKey);

    if (!json.success) {
      return NextResponse.json({ error: json.message ?? 'Impossible de récupérer le statut OTP' }, { status });
    }

    return NextResponse.json({ ...json, debug: { hasAuthSessionKey: true } });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
