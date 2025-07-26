'use client';

import { ProjectList } from '@/components/projects/project-list';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your multi-agent projects and deployments.
          </p>
        </div>
      </div>
      
      <ProjectList />
    </div>
  );
}