import { NextRequest, NextResponse } from 'next/server';
import { requireTenantAccess, createErrorResponse } from '@/lib/server-auth';
import { cancelSubscription } from '@/lib/stripe/server';

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await request.json();

    if (!tenantId) {
      return createErrorResponse('Tenant ID is required', 400);
    }

    // Verify user has access to this tenant
    const user = await requireTenantAccess(tenantId, request);

    // TODO: Fetch the subscription ID from the database
    // Example query:
    /*
    const subscriptionData = await executeGraphQL({
      query: `
        query GetSubscriptionId($tenantId: uuid!) {
          tenant_subscriptions(where: { tenant_id: { _eq: $tenantId } }) {
            stripe_subscription_id
          }
        }
      `,
      variables: { tenantId }
    });

    const stripeSubscriptionId = subscriptionData.tenant_subscriptions[0]?.stripe_subscription_id;
    */

    // Mock subscription ID for now
    const stripeSubscriptionId = 'sub_mock123';

    if (!stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel the subscription at period end
    await cancelSubscription({
      subscriptionId: stripeSubscriptionId,
      cancelAtPeriodEnd: true,
    });

    // TODO: Update the database to reflect the cancellation
    /*
    await executeGraphQL({
      query: `
        mutation UpdateSubscriptionCancellation($tenantId: uuid!) {
          update_tenant_subscriptions(
            where: { tenant_id: { _eq: $tenantId } }
            _set: { cancel_at_period_end: true }
          ) {
            affected_rows
          }
        }
      `,
      variables: { tenantId }
    });
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    
    // If it's already a Response (from auth check), return it
    if (error instanceof Response) {
      return error;
    }
    
    return createErrorResponse('Failed to cancel subscription');
  }
}