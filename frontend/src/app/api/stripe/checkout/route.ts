import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { priceId, planType } = await request.json();

    if (!priceId || !planType || !(planType in SUBSCRIPTION_PLANS)) {
      return NextResponse.json(
        { error: 'Invalid plan type or price ID' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const checkoutSession = await createCheckoutSession({
      priceId,
      successUrl: `${baseUrl}/dashboard/settings/billing?success=true`,
      cancelUrl: `${baseUrl}/pricing?canceled=true`,
      tenantId: session.user.tenantId,
      trialDays: 14, // 14-day free trial
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}