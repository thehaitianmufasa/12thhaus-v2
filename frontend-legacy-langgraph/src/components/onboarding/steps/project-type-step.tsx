'use client';

import { useState } from 'react';
import { OnboardingData } from '../onboarding-wizard';

interface ProjectTypeStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const projectTypes = [
  {
    id: 'automation',
    name: 'Business Automation',
    description: 'Automate workflows and business processes',
    icon: '⚙️',
  },
  {
    id: 'analytics',
    name: 'Data Analytics',
    description: 'Analyze data and generate insights',
    icon: '📊',
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Build intelligent conversational agents',
    icon: '🤖',
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Enhance customer support operations',
    icon: '💬',
  },
  {
    id: 'content-generation',
    name: 'Content Generation',
    description: 'Create and manage content at scale',
    icon: '✍️',
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Custom use case not listed above',
    icon: '🎯',
  },
];

const useCases = [
  'Document Processing',
  'Customer Support',
  'Lead Generation',
  'Content Creation',
  'Data Analysis',
  'Workflow Automation',
  'Research & Development',
  'Quality Assurance',
  'Other',
];

export function ProjectTypeStep({ data, updateData, onNext, onPrev, isFirstStep }: ProjectTypeStepProps) {
  const [formData, setFormData] = useState(data.projectType);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleProjectTypeSelect = (typeId: string) => {
    setFormData(prev => ({ ...prev, type: typeId }));
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: '' }));
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type) {
      newErrors.type = 'Please select a project type';
    }
    
    if (!formData.useCase) {
      newErrors.useCase = 'Please select a use case';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      updateData({ projectType: formData });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Project Type</h3>
        <p className="mt-1 text-sm text-gray-600">
          What type of project are you planning to build?
        </p>
      </div>

      {/* Project Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Project Type *
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {projectTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleProjectTypeSelect(type.id)}
              className={`relative rounded-lg border p-4 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.type === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div className="text-2xl mr-3">{type.icon}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {type.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {type.description}
                  </p>
                </div>
                {formData.type === type.id && (
                  <div className="absolute top-3 right-3">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type}</p>
        )}
      </div>

      {/* Use Case */}
      <div>
        <label htmlFor="use-case" className="block text-sm font-medium text-gray-700">
          Primary Use Case *
        </label>
        <select
          id="use-case"
          value={formData.useCase}
          onChange={(e) => handleInputChange('useCase', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select a use case</option>
          {useCases.map((useCase) => (
            <option key={useCase} value={useCase}>
              {useCase}
            </option>
          ))}
        </select>
        {errors.useCase && (
          <p className="mt-1 text-sm text-red-600">{errors.useCase}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Project Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Tell us more about your project goals and requirements..."
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <div>
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Previous
            </button>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
}