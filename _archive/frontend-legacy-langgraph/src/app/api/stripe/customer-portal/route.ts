import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPortalSession } from '@/lib/stripe/server';
import { requireTenantAccess, createErrorResponse } from '@/lib/server-auth';

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await request.json();
    
    if (!tenantId) {
      return createErrorResponse('Tenant ID is required', 400);
    }

    // Verify user has access to this tenant
    const user = await requireTenantAccess(tenantId, request);

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
    
    // If it's already a Response (from auth check), return it
    if (error instanceof Response) {
      return error;
    }
    
    return createErrorResponse('Failed to create customer portal session');
  }
}