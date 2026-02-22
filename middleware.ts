// middleware.ts — Protect Explore, Dashboard, Profile; allow login/signup and API
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, getCookieName } from '@/lib/jwt';

const PROTECTED = ['/explore', '/dashboard', '/profile'];
const AUTH_PAGES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(getCookieName())?.value;

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'));
  const isAuthPage = AUTH_PAGES.some(p => pathname.startsWith(p));

  if (isProtected) {
    if (!token) {
      const login = new URL('/login', request.url);
      login.searchParams.set('redirect', pathname);
      return NextResponse.redirect(login);
    }
    try {
      await verifyToken(token);
    } catch {
      const login = new URL('/login', request.url);
      login.searchParams.set('redirect', pathname);
      return NextResponse.redirect(login);
    }
  }

  if (isAuthPage && token) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL('/explore', request.url));
    } catch {
      // invalid token, allow auth page
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/explore', '/explore/:path*', '/dashboard', '/dashboard/:path*', '/profile', '/profile/:path*', '/login', '/signup'],
};
