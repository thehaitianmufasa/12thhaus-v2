'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const techStackOptions = [
  'Python',
  'LangChain',
  'LangGraph',
  'FastAPI',
  'Django',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'OpenAI',
  'Anthropic',
  'Hugging Face',
  'Apache Airflow',
  'N8N',
  'React',
  'Next.js',
  'TypeScript',
];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { tenantId, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tech_stack: [] as string[],
    repository_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual GraphQL mutation
      console.log('Creating project:', {
        ...formData,
        tenant_id: tenantId,
        created_by: user?.id,
        status: 'active',
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        tech_stack: [],
        repository_url: '',
      });
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.includes(tech)
        ? prev.tech_stack.filter(t => t !== tech)
        : [...prev.tech_stack, tech]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Create New Project</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="E.g., Customer Support Assistant"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Describe what this project will accomplish..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technology Stack
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-300 rounded-md">
                {techStackOptions.map((tech) => (
                  <label key={tech} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tech_stack.includes(tech)}
                      onChange={() => toggleTechStack(tech)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{tech}</span>
                  </label>
                ))}
              </div>
              {formData.tech_stack.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Selected: {formData.tech_stack.join(', ')}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="repository_url" className="block text-sm font-medium text-gray-700 mb-2">
                Repository URL (Optional)
              </label>
              <input
                type="url"
                id="repository_url"
                value={formData.repository_url}
                onChange={(e) => setFormData(prev => ({ ...prev, repository_url: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="https://github.com/your-org/your-project"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}