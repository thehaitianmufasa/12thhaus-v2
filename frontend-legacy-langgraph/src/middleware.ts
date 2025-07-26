import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/callback',
    '/auth/register', 
    '/auth/error',
    '/api/auth/logto',
    '/api/health',
  ];

  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Allow access to public routes and API routes
  if (isPublicRoute || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // For now, let React components handle authentication checks
  // This avoids Edge Runtime compatibility issues with Logto
  // TODO: Implement proper middleware authentication once Logto Edge support is available
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api/(?!auth)|_next/static|_next/image|favicon.ico|.*\.png$|.*\.jpg$|.*\.jpeg$|.*\.gif$|.*\.svg$).*)',
  ],
};