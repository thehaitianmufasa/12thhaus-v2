'use client';

import { useAuth } from '@/hooks/use-auth';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';

export default function DashboardPage() {
  const { user, tenantName } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here&apos;s what&apos;s happening in {tenantName}.
        </p>
      </div>
      
      <DashboardOverview />
    </div>
  );
}