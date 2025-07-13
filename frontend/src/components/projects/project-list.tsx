'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ProjectCard } from './project-card';
import { CreateProjectModal } from './create-project-modal';

export function ProjectList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');

  // Mock data for now - will be replaced with GraphQL queries
  const projects = [
    {
      id: '1',
      name: 'E-commerce Assistant',
      description: 'AI-powered customer service automation for online retail',
      status: 'active' as const,
      tech_stack: ['Python', 'LangChain', 'FastAPI', 'PostgreSQL'],
      created_at: '2025-01-10T10:00:00Z',
      updated_at: '2025-01-13T15:30:00Z',
      agents_count: 5,
      workflows_count: 3,
      repository_url: 'https://github.com/company/ecommerce-assistant',
      deployment_url: 'https://ecommerce-assistant.app.com',
    },
    {
      id: '2',
      name: 'Customer Support Bot',
      description: 'Multi-language support automation with sentiment analysis',
      status: 'active' as const,
      tech_stack: ['Python', 'LangGraph', 'Redis', 'Docker'],
      created_at: '2025-01-08T14:20:00Z',
      updated_at: '2025-01-13T09:15:00Z',
      agents_count: 8,
      workflows_count: 5,
      repository_url: 'https://github.com/company/support-bot',
      deployment_url: 'https://support-bot.app.com',
    },
    {
      id: '3',
      name: 'Content Generation Pipeline',
      description: 'Automated content creation and optimization for marketing',
      status: 'paused' as const,
      tech_stack: ['Python', 'OpenAI', 'WordPress API', 'MongoDB'],
      created_at: '2025-01-05T08:45:00Z',
      updated_at: '2025-01-12T16:20:00Z',
      agents_count: 3,
      workflows_count: 2,
      repository_url: 'https://github.com/company/content-pipeline',
      deployment_url: null,
    },
    {
      id: '4',
      name: 'Data Analytics Assistant',
      description: 'Intelligent data analysis and reporting automation',
      status: 'active' as const,
      tech_stack: ['Python', 'Pandas', 'Plotly', 'Apache Airflow'],
      created_at: '2025-01-03T12:10:00Z',
      updated_at: '2025-01-13T11:45:00Z',
      agents_count: 4,
      workflows_count: 6,
      repository_url: 'https://github.com/company/analytics-assistant',
      deployment_url: 'https://analytics.app.com',
    },
  ];

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const statusCounts = {
    all: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    paused: projects.filter(p => p.status === 'paused').length,
    archived: 0, // No archived projects in mock data
  };

  return (
    <div className="space-y-6">
      {/* Header with filters and create button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex rounded-lg bg-gray-100 p-1">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === status
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Project
        </button>
      </div>

      {/* Project grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first multi-agent project.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}