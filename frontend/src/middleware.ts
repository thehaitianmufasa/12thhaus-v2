import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow access to auth pages without authentication
    if (pathname.startsWith('/auth/')) {
      return NextResponse.next();
    }

    // Redirect to login if not authenticated
    if (!token) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check tenant-specific access
    if (pathname.startsWith('/tenant/') && !token.tenantId) {
      return NextResponse.redirect(new URL('/auth/select-tenant', req.url));
    }

    // Admin-only routes
    if (pathname.startsWith('/admin/') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Tenant admin routes
    if (
      pathname.startsWith('/tenant-admin/') && 
      !['admin', 'tenant_admin'].includes(token.role as string)
    ) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes that don't require authentication
        const publicRoutes = [
          '/',
          '/auth/login',
          '/auth/register',
          '/auth/error',
          '/api/auth',
        ];

        const isPublicRoute = publicRoutes.some(route => 
          pathname.startsWith(route)
        );

        if (isPublicRoute) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};