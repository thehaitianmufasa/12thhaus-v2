import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/server';
import { requireAuthentication, createErrorResponse } from '@/lib/server-auth';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await requireAuthentication(request);

    const { priceId, planType } = await request.json();

    if (!priceId || !planType || !(planType in SUBSCRIPTION_PLANS)) {
      return createErrorResponse('Invalid plan type or price ID', 400);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const checkoutSession = await createCheckoutSession({
      priceId,
      successUrl: `${baseUrl}/dashboard/settings/billing?success=true`,
      cancelUrl: `${baseUrl}/pricing?canceled=true`,
      tenantId: user.tenantId || '',
      trialDays: 14, // 14-day free trial
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    
    // If it's already a Response (from auth check), return it
    if (error instanceof Response) {
      return error;
    }
    
    return createErrorResponse('Failed to create checkout session');
  }
}