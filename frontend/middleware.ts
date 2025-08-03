import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware that doesn't use Clerk Edge Runtime modules
export function middleware(request: NextRequest) {
  // Allow all requests to pass through for now
  // Auth protection will be handled at the page level
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
}
