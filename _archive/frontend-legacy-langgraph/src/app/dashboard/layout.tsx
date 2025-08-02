'use client';

import { useRequireAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useRequireAuth();

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return null; // Will redirect via useRequireAuth
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}