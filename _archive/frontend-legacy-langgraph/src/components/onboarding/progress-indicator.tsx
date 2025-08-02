'use client';

import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={cn(
            stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 
            'relative'
          )}>
            {/* Connector line */}
            {stepIdx !== steps.length - 1 && (
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className={cn(
                  'h-0.5 w-full',
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                )} />
              </div>
            )}
            
            {/* Step indicator */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white border-2">
              {currentStep > step.id ? (
                <div className="h-8 w-8 rounded-full bg-blue-600 border-2 border-blue-600 flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : currentStep === step.id ? (
                <div className="h-8 w-8 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{step.id}</span>
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-medium">{step.id}</span>
                </div>
              )}
            </div>
            
            {/* Step name */}
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
              <span className={cn(
                'text-xs font-medium whitespace-nowrap',
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
              )}>
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}