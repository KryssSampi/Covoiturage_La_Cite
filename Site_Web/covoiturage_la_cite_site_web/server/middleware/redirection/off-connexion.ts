import { NextRequest , NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const protectedRoutes = ['/admin', '/driver', '/passenger'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const user =  request.cookies.get('userConnected')?.value || sessionStorage.getItem('userConnected');
 
    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/driver/:path*', '/passenger/:path*'],
};

export default middleware; 

export const runtime = 'edge';

