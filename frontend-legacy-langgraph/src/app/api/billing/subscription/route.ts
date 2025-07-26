import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAccess, createErrorResponse } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return createErrorResponse('Tenant ID is required', 400);
    }

    // Verify user has access to this tenant
    const user = await requireTenantAccess(tenantId, request);

    // TODO: Implement GraphQL query to fetch subscription data
    // Example query:
    /*
    const subscriptionData = await executeGraphQL({
      query: `
        query GetTenantSubscription($tenantId: uuid!) {
          tenant_subscriptions(where: { tenant_id: { _eq: $tenantId } }) {
            id
            stripe_subscription_id
            stripe_customer_id
            plan_type
            status
            current_period_start
            current_period_end
            trial_start
            trial_end
            cancel_at_period_end
          }
        }
      `,
      variables: { tenantId }
    });
    */

    // Mock data for now - replace with actual database query
    const mockSubscription = {
      id: '1',
      status: 'active',
      planType: 'pro',
      currentPeriodStart: '2025-01-01T00:00:00Z',
      currentPeriodEnd: '2025-02-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      stripeCustomerId: 'cus_mock123',
      stripeSubscriptionId: 'sub_mock123',
    };

    return NextResponse.json(mockSubscription);
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    
    // If it's already a Response (from auth check), return it
    if (error instanceof Response) {
      return error;
    }
    
    return createErrorResponse('Failed to fetch subscription');
  }
}