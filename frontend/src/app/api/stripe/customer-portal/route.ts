import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPortalSession } from '@/lib/stripe/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

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

    // TODO: Fetch the Stripe customer ID from your database
    // For now, we'll use a mock customer ID
    // In production, you would query: SELECT stripe_customer_id FROM tenant_subscriptions WHERE tenant_id = ?
    const stripeCustomerId = 'cus_mock123'; // This should come from database

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const portalSession = await createCustomerPortalSession({
      customerId: stripeCustomerId,
      returnUrl: `${baseUrl}/dashboard/settings/billing`,
    });

    return NextResponse.json({
      portalUrl: portalSession.url,
    });
  } catch (error) {
    console.error('Customer portal session creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}