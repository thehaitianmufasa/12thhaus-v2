'use client';

import { useState } from 'react';
import { OnboardingData } from '../onboarding-wizard';

interface ConfigurationStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const availableFeatures = [
  {
    id: 'real-time-monitoring',
    name: 'Real-time Monitoring',
    description: 'Monitor your agents and workflows in real-time',
    icon: '📊',
  },
  {
    id: 'auto-scaling',
    name: 'Auto Scaling',
    description: 'Automatically scale resources based on demand',
    icon: '⚡',
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Deep insights and performance analytics',
    icon: '📈',
  },
  {
    id: 'custom-integrations',
    name: 'Custom Integrations',
    description: 'Connect with your existing tools and systems',
    icon: '🔗',
  },
  {
    id: 'collaboration-tools',
    name: 'Collaboration Tools',
    description: 'Team workspaces and sharing capabilities',
    icon: '👥',
  },
  {
    id: 'version-control',
    name: 'Version Control',
    description: 'Track changes and manage versions',
    icon: '📝',
  },
];

const integrationOptions = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: '💬',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repository and CI/CD integration',
    icon: '🐙',
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Project management and issue tracking',
    icon: '📋',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'CRM integration and data sync',
    icon: '☁️',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Google Drive, Sheets, and Calendar',
    icon: '📁',
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Office applications and SharePoint',
    icon: '📊',
  },
];

export function ConfigurationStep({ data, updateData, onNext, onPrev, isFirstStep }: ConfigurationStepProps) {
  const [formData, setFormData] = useState(data.configuration);

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(id => id !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const toggleIntegration = (integrationId: string) => {
    setFormData(prev => ({
      ...prev,
      integrations: prev.integrations.includes(integrationId)
        ? prev.integrations.filter(id => id !== integrationId)
        : [...prev.integrations, integrationId]
    }));
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setFormData(prev => ({ ...prev, notifications: enabled }));
  };

  const handleNext = () => {
    updateData({ configuration: formData });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
        <p className="mt-1 text-sm text-gray-600">
          Customize your workspace with the features and integrations you need.
        </p>
      </div>

      {/* Features Selection */}
      <div>
        <h4 className="text-base font-medium text-gray-900 mb-4">Features</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {availableFeatures.map((feature) => (
            <div
              key={feature.id}
              onClick={() => toggleFeature(feature.id)}
              className={`relative rounded-lg border p-4 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.features.includes(feature.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div className="text-xl mr-3">{feature.icon}</div>
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">
                    {feature.name}
                  </h5>
                  <p className="text-xs text-gray-500 mt-1">
                    {feature.description}
                  </p>
                </div>
                {formData.features.includes(feature.id) && (
                  <div className="absolute top-3 right-3">
                    <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations Selection */}
      <div>
        <h4 className="text-base font-medium text-gray-900 mb-4">Integrations</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {integrationOptions.map((integration) => (
            <div
              key={integration.id}
              onClick={() => toggleIntegration(integration.id)}
              className={`relative rounded-lg border p-3 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.integrations.includes(integration.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className="text-lg mr-3">{integration.icon}</div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-gray-900 truncate">
                    {integration.name}
                  </h5>
                  <p className="text-xs text-gray-500 truncate">
                    {integration.description}
                  </p>
                </div>
                {formData.integrations.includes(integration.id) && (
                  <div className="ml-2">
                    <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications Settings */}
      <div>
        <h4 className="text-base font-medium text-gray-900 mb-4">Notification Preferences</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Email Notifications</h5>
              <p className="text-sm text-gray-500">Receive updates about your projects and agents</p>
            </div>
            <button
              type="button"
              onClick={() => handleNotificationsChange(!formData.notifications)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                formData.notifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
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