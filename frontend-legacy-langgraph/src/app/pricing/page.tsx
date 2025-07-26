'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { SUBSCRIPTION_PLANS, PlanType } from '@/lib/stripe/config';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const [isAnnual, setIsAnnual] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

  const handleSelectPlan = async (planType: PlanType) => {
    if (planType === 'free') {
      // Redirect to signup or dashboard if already authenticated
      if (isAuthenticated) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/auth/login';
      }
      return;
    }

    setLoadingPlan(planType);
    
    try {
      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: SUBSCRIPTION_PLANS[planType].priceId,
          planType,
        }),
      });

      const { checkoutUrl } = await response.json();
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const getPrice = (plan: typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS]) => {
    if (plan.price === 0) return 'Free';
    const price = isAnnual ? Math.floor(plan.price * 0.83) : plan.price; // 17% discount for annual
    return `$${price}`;
  };

  const getPeriod = () => {
    return isAnnual ? '/year' : '/month';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your team size and workflow complexity.
            Start with our free tier and scale as you grow.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-12 flex justify-center">
          <div className="relative bg-gray-100 rounded-lg p-1 flex items-center">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                'relative px-4 py-2 text-sm font-medium rounded-md transition-all',
                !isAnnual
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                'relative px-4 py-2 text-sm font-medium rounded-md transition-all',
                isAnnual
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Annual
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
            const planType = key as PlanType;
            const isPopular = planType === 'pro';
            const isLoading = loadingPlan === planType;

            return (
              <div
                key={planType}
                className={cn(
                  'relative bg-white rounded-2xl shadow-lg overflow-hidden',
                  isPopular ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
                )}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {plan.description}
                    </p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {getPrice(plan)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600">
                          {getPeriod()}
                        </span>
                      )}
                    </div>
                    {isAnnual && plan.price > 0 && (
                      <p className="mt-1 text-sm text-gray-500">
                        ${plan.price}/month billed annually
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-3 text-gray-700 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="mt-8">
                    <button
                      onClick={() => handleSelectPlan(planType)}
                      disabled={isLoading}
                      className={cn(
                        'w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
                        isPopular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                          : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500',
                        isLoading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : planType === 'free' ? (
                        'Get Started Free'
                      ) : isAuthenticated ? (
                        `Upgrade to ${plan.name}`
                      ) : (
                        `Start ${plan.name} Plan`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I exceed my limits?
              </h3>
              <p className="text-gray-600">
                We'll notify you when you're approaching your limits. You can upgrade your plan or some features may be temporarily restricted.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Our Free plan lets you explore 12thhaus with no time limits. Paid plans include a 14-day free trial.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How does billing work?
              </h3>
              <p className="text-gray-600">
                Billing is per tenant/organization. You'll be charged based on your selected plan and billing cycle (monthly or annual).
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="text-gray-600 mb-4">
            Ready to get started with 12thhaus?
          </p>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Sign Up Free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}