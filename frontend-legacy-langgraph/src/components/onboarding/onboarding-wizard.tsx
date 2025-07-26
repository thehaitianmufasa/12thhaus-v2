'use client';

import { useState, useEffect } from 'react';
import { CompanyInfoStep } from './steps/company-info-step';
import { ProjectTypeStep } from './steps/project-type-step';
import { ConfigurationStep } from './steps/configuration-step';
import { CompletionStep } from './steps/completion-step';
import { ProgressIndicator } from './progress-indicator';

export interface OnboardingData {
  companyInfo: {
    name: string;
    industry: string;
    size: string;
    website: string;
  };
  projectType: {
    type: string;
    description: string;
    useCase: string;
  };
  configuration: {
    features: string[];
    integrations: string[];
    notifications: boolean;
  };
  isComplete: boolean;
}

const STORAGE_KEY = 'onboarding-progress';

const initialData: OnboardingData = {
  companyInfo: {
    name: '',
    industry: '',
    size: '',
    website: '',
  },
  projectType: {
    type: '',
    description: '',
    useCase: '',
  },
  configuration: {
    features: [],
    integrations: [],
    notifications: true,
  },
  isComplete: false,
};

const steps = [
  { id: 1, name: 'Company Info', component: CompanyInfoStep },
  { id: 2, name: 'Project Type', component: ProjectTypeStep },
  { id: 3, name: 'Configuration', component: ConfigurationStep },
  { id: 4, name: 'Complete', component: CompletionStep },
];

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setData(parsedData);
        
        // Determine which step to start from based on saved data
        if (parsedData.isComplete) {
          setCurrentStep(4);
        } else if (parsedData.configuration.features.length > 0) {
          setCurrentStep(3);
        } else if (parsedData.projectType.type) {
          setCurrentStep(2);
        } else if (parsedData.companyInfo.name) {
          setCurrentStep(1);
        }
      } catch (error) {
        console.error('Failed to parse saved onboarding data:', error);
      }
    }
  }, []);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = (stepData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem(STORAGE_KEY);
    onSkip?.();
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const completeData = { ...data, isComplete: true };
      setData(completeData);
      localStorage.removeItem(STORAGE_KEY);
      onComplete(completeData);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to 12thhaus
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's get your workspace set up in just a few steps
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Indicator */}
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            className="mb-8"
          />

          {/* Current Step Content */}
          <CurrentStepComponent
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onPrev={handlePrev}
            onComplete={handleComplete}
            onSkip={handleSkip}
            isLoading={isLoading}
            isFirstStep={currentStep === 1}
            isLastStep={currentStep === steps.length}
          />
        </div>

        {/* Skip Option */}
        {currentStep < steps.length && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip setup for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}