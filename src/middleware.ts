import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
const protectedRoutes = ['/dashboard', '/interview', '/resume'];
const authRoutes = ['/signin', '/signup'];
export function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('session') || '';

    // This only checks if session cookie exists or not , it does not verify | Verify it in server side
    // if sessionCookie exists then only allow access to protected pages;
    const isProtected = protectedRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route)
    );

    const isAccessingAuth = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

    if(isProtected && !sessionCookie) {
        console.log("User not signed in");
        const signinURL =  new URL('/signin', request.url)
        return NextResponse.redirect(signinURL)
    }

    if(isAccessingAuth && sessionCookie) {
        console.log("User already signed in");
        const dashboardURL = new URL('/dashboard', request.url)
        return NextResponse.redirect(dashboardURL)
    }
    return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/interview/:path*', '/resume/:path*', '/signin/:path*', '/signup/:path*'],
};