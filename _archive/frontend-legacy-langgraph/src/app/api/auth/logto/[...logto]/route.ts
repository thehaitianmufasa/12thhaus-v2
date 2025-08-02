import { NextRequest, NextResponse } from 'next/server';

// Temporary auth route handler - Logto auth will be handled client-side
// TODO: Implement proper server-side auth routes when Logto App Router support is available

export async function GET(request: NextRequest) {
  // For now, redirect auth requests to the main auth flow
  return NextResponse.redirect(new URL('/auth/login', request.url));
}

export async function POST(request: NextRequest) {
  // For now, redirect auth requests to the main auth flow
  return NextResponse.redirect(new URL('/auth/login', request.url));
}