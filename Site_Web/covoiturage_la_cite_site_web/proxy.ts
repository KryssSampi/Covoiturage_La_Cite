import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy Next.js — Protection des routes par vérification du token JWT.
 *
 * Routes protégées : /admin/*, /driver/*, /passenger/*
 * → Vérifie la présence du cookie `sc_token`.
 * → Redirige vers /login si absent.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes protégées : nécessitent un sc_token
  const protectedPrefixes = ['/admin', '/driver', '/passenger'];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const token = request.cookies.get('sc_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/driver/:path*', '/passenger/:path*'],
};
