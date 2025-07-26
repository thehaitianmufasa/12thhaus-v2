'use client';

import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireUserType?: string;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Simplified protected route for build - replace with actual auth logic
  return <>{children}</>;
}
