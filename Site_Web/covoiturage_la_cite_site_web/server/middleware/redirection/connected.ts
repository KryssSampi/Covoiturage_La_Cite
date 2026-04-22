
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const publicRoutes = ['/', '/login', '/register'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const user = request.cookies.get('userConnected')?.value ;// || sessionStorage.getItem('userConnected');
    if (isPublicRoute && user ) {
        const parsed = JSON.parse(user);
        const role = String(parsed.role ?? '').toLowerCase();
        const destination = role === 'admin' ? '/admin' : `/${role}/${parsed.id}`;
        return NextResponse.redirect(new URL(destination, request.url));
    }
    console.log('Middleware de redirection connecté : ', { pathname, isPublicRoute, user });
    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/register'],
};

export default middleware;

export const runtime = 'edge';
