import { NextResponse } from 'next/server';
import { extractToken } from '@/server/auth';

export const dynamic = 'force-dynamic';

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    // atob not available in Node 18? But Next runtime supports global atob
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const token = await extractToken(req);
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  const payload = decodeJwtPayload(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

  // Return standard fields if present: exp (seconds since epoch)
  return NextResponse.json({ exp: payload.exp ?? null, iat: payload.iat ?? null });
}
