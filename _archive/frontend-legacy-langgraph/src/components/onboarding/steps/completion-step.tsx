'use client';

import { OnboardingData } from '../onboarding-wizard';

interface CompletionStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  isLoading: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function CompletionStep({ 
  data, 
  onPrev, 
  onComplete, 
  isLoading, 
  isFirstStep 
}: CompletionStepProps) {
  const selectedFeatures = data.configuration.features;
  const selectedIntegrations = data.configuration.integrations;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Setup Complete!
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Review your configuration and complete the setup.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h4 className="text-base font-medium text-gray-900">Configuration Summary</h4>
        
        {/* Company Info */}
        <div>
          <h5 className="text-sm font-medium text-gray-700">Company</h5>
          <p className="text-sm text-gray-600">
            {data.companyInfo.name} • {data.companyInfo.industry} • {data.companyInfo.size}
          </p>
        </div>

        {/* Project Type */}
        <div>
          <h5 className="text-sm font-medium text-gray-700">Project Type</h5>
          <p className="text-sm text-gray-600 capitalize">
            {data.projectType.type.replace('-', ' ')} • {data.projectType.useCase}
          </p>
        </div>

        {/* Features */}
        {selectedFeatures.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700">Selected Features</h5>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedFeatures.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {feature.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Integrations */}
        {selectedIntegrations.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700">Selected Integrations</h5>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedIntegrations.map((integration) => (
                <span
                  key={integration}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {integration.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        <div>
          <h5 className="text-sm font-medium text-gray-700">Notifications</h5>
          <p className="text-sm text-gray-600">
            Email notifications: {data.configuration.notifications ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-base font-medium text-blue-900 mb-3">What's Next?</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 mr-3"></span>
            Create your first project in the dashboard
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 mr-3"></span>
            Configure your agents and workflows
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 mr-3"></span>
            Explore analytics and monitoring features
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 mr-3"></span>
            Set up team access and permissions
          </li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <div>
          {!isFirstStep && (
            <button
              type="button"
              onClick={onPrev}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Previous
            </button>
          )}
        </div>
        
        <button
          type="button"
          onClick={onComplete}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Completing Setup...
            </>
          ) : (
            'Complete Setup'
          )}
        </button>
      </div>
    </div>
  );
}