'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { SUBSCRIPTION_PLANS, PlanType } from '@/lib/stripe/config';
import { cn } from '@/lib/utils';

interface SubscriptionData {
  id: string;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'unpaid';
  planType: PlanType;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
}

interface UsageData {
  users: { current: number; limit: number };
  projects: { current: number; limit: number };
  workflows: { current: number; limit: number };
}

export default function BillingPage() {
  const { tenantId } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    if (!tenantId) return;

    try {
      const [subResponse, usageResponse] = await Promise.all([
        fetch(`/api/billing/subscription?tenantId=${tenantId}`),
        fetch(`/api/billing/usage?tenantId=${tenantId}`)
      ]);

      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData);
      }

      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData);
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleUpgrade = async (planType: PlanType) => {
    setActionLoading('upgrade');
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      console.error('Failed to create checkout:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCustomerPortal = async () => {
    setActionLoading('portal');
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });

      const { portalUrl } = await response.json();
      if (portalUrl) {
        window.location.href = portalUrl;
      }
    } catch (error) {
      console.error('Failed to create customer portal session:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You can continue using paid features until the end of your billing period.')) {
      return;
    }

    setActionLoading('cancel');
    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });

      if (response.ok) {
        await fetchBillingData();
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const currentPlan = subscription ? SUBSCRIPTION_PLANS[subscription.planType] : SUBSCRIPTION_PLANS.free;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-medium text-gray-900">Billing & Subscription</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your subscription, billing, and usage limits.
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Current Plan</h2>
          {subscription && (
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getStatusColor(subscription.status)
            )}>
              {subscription.status.replace('_', ' ')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{currentPlan.name}</h3>
            <p className="text-gray-600 mt-1">{currentPlan.description}</p>
            
            {subscription ? (
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Billing cycle:</span>{' '}
                  {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                </p>
                {subscription.trialEnd && (
                  <p>
                    <span className="font-medium">Trial ends:</span>{' '}
                    {formatDate(subscription.trialEnd)}
                  </p>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-red-600">
                    <span className="font-medium">Cancels on:</span>{' '}
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-600">
                You're currently on the free plan.
              </p>
            )}
          </div>

          <div className="flex flex-col justify-end space-y-3">
            {subscription?.planType !== 'enterprise' && (
              <button
                onClick={() => handleUpgrade(subscription?.planType === 'free' ? 'pro' : 'enterprise')}
                disabled={actionLoading === 'upgrade'}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {actionLoading === 'upgrade' ? 'Processing...' : 
                  subscription?.planType === 'free' ? 'Upgrade to Pro' : 'Upgrade to Enterprise'
                }
              </button>
            )}

            {subscription && subscription.stripeCustomerId && (
              <button
                onClick={handleCustomerPortal}
                disabled={actionLoading === 'portal'}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {actionLoading === 'portal' ? 'Loading...' : 'Manage Billing'}
              </button>
            )}

            {subscription && subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading === 'cancel'}
                className="inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {actionLoading === 'cancel' ? 'Processing...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Usage */}
      {usage && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Usage & Limits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Users */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Users</span>
                <span className="text-sm text-gray-600">
                  {usage.users.current} / {usage.users.limit === -1 ? '∞' : usage.users.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${getUsagePercentage(usage.users.current, usage.users.limit)}%` }}
                />
              </div>
            </div>

            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Projects</span>
                <span className="text-sm text-gray-600">
                  {usage.projects.current} / {usage.projects.limit === -1 ? '∞' : usage.projects.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${getUsagePercentage(usage.projects.current, usage.projects.limit)}%` }}
                />
              </div>
            </div>

            {/* Workflows */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Workflows</span>
                <span className="text-sm text-gray-600">
                  {usage.workflows.current} / {usage.workflows.limit === -1 ? '∞' : usage.workflows.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${getUsagePercentage(usage.workflows.current, usage.workflows.limit)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Features */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Plan Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPlan.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <svg
                className="h-5 w-5 text-green-500 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}