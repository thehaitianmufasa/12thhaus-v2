import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { cancelSubscription } from '@/lib/stripe/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tenantId } = await request.json();

    if (tenantId !== session.user.tenantId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

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
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}