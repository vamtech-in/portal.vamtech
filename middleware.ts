import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, SESSION_COOKIE_NAME } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and internal routes bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt'
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await decrypt(sessionCookie) : null;

  // Protect /dashboard/* routes
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.mustResetPassword && pathname !== '/reset-password') {
      return NextResponse.redirect(new URL('/reset-password', request.url));
    }
  }

  // Protect /hr/* routes (ADMIN ONLY)
  if (pathname.startsWith('/hr')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.mustResetPassword && pathname !== '/reset-password') {
      return NextResponse.redirect(new URL('/reset-password', request.url));
    }

    if (session.role !== 'admin') {
      // Non-admin employee attempting to access HR dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Handle /reset-password route
  if (pathname === '/reset-password') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If already logged in and visiting /login, redirect to appropriate dashboard
  if (pathname === '/login' && session) {
    if (session.mustResetPassword) {
      return NextResponse.redirect(new URL('/reset-password', request.url));
    }
    const redirectTarget = session.role === 'admin' ? '/hr' : '/dashboard';
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/hr/:path*', '/login', '/reset-password'],
};
