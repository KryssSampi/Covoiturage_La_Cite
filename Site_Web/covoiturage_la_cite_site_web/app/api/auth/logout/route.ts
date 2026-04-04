import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/server/auth';
import { SERVER_CORE_URL } from '@/server/config';

/**
 * POST /api/auth/logout
 * 1) Appelle le Server Core pour invalider la session côté backend
 * 2) Supprime le cookie JWT côté web
 */
export async function POST(req: Request) {
  // Forward incoming cookies to Server Core so it can identify/invalidate the session
  try {
    const cookieHeader = req.headers.get('cookie') ?? '';
    // Fire-and-forget to Server Core logout (best-effort)
    await fetch(`${SERVER_CORE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
  } catch {
    // Ignore errors — we still clear local cookie
  }

  const response = NextResponse.json({ success: true });
  clearTokenCookie(response);
  return response;
}
