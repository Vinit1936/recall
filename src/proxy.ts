import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;

  const isAuthRoute = nextUrl.pathname.startsWith('/auth');
  const isApiAuth = nextUrl.pathname.startsWith('/api/auth');
  const isPublicApi = isApiAuth || nextUrl.pathname.startsWith('/api/github');
  const isApiRoute = nextUrl.pathname.startsWith('/api/');
  const isProtectedRoute =
    nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/daily') ||
    nextUrl.pathname.startsWith('/settings');

  // If user has an explicit auth error (e.g. SessionRequired), do not redirect back to dashboard
  const hasAuthError = isAuthRoute && nextUrl.searchParams.has('error');

  // If user is already logged in and visits landing page (/) or auth pages (without error), redirect to dashboard
  if ((nextUrl.pathname === '/' || isAuthRoute) && isLoggedIn && !hasAuthError) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Allow auth pages and public APIs for unauthenticated users
  if (nextUrl.pathname === '/' || isAuthRoute || isPublicApi) {
    return NextResponse.next();
  }

  // Handle unauthenticated requests
  if (!isLoggedIn) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (isProtectedRoute) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}&error=SessionRequired`, nextUrl)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api/auth|api/github|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
};

