import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (tenantId !== session.user.tenantId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

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
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}