import { NextResponse } from 'next/server';
import { clearTokenCookie } from '@/server/auth';

/**
 * POST /api/auth/logout
 * Supprime le cookie JWT.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  clearTokenCookie(response);
  return response;
}
