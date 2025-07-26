import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/stripe/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handling failed:', error);
    return NextResponse.json(
      { error: 'Webhook handling failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata.tenantId;
  
  if (!tenantId) {
    console.error('No tenant ID in subscription metadata');
    return;
  }

  // Update tenant subscription in database
  // This would typically use your GraphQL mutation or database client
  console.log(`Subscription created for tenant ${tenantId}:`, subscription.id);
  
  // TODO: Implement database update logic
  // Example GraphQL mutation:
  /*
  await executeGraphQL({
    query: `
      mutation UpdateTenantSubscription($tenantId: uuid!, $subscriptionData: tenant_subscriptions_set_input!) {
        update_tenant_subscriptions(
          where: { tenant_id: { _eq: $tenantId } }
          _set: $subscriptionData
        ) {
          affected_rows
        }
      }
    `,
    variables: {
      tenantId,
      subscriptionData: {
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
      }
    }
  });
  */
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata.tenantId;
  
  if (!tenantId) {
    console.error('No tenant ID in subscription metadata');
    return;
  }

  console.log(`Subscription updated for tenant ${tenantId}:`, subscription.id);
  
  // TODO: Implement database update logic similar to handleSubscriptionCreated
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata.tenantId;
  
  if (!tenantId) {
    console.error('No tenant ID in subscription metadata');
    return;
  }

  console.log(`Subscription deleted for tenant ${tenantId}:`, subscription.id);
  
  // TODO: Implement database update logic
  // Set status to 'cancelled' and handle cleanup
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscription = (invoice as any).subscription;
  const subscriptionId = typeof subscription === 'string' 
    ? subscription 
    : subscription?.id;
  
  if (subscriptionId) {
    console.log(`Payment succeeded for subscription: ${subscriptionId}`);
    // TODO: Update payment status, send confirmation email, etc.
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = (invoice as any).subscription;
  const subscriptionId = typeof subscription === 'string'
    ? subscription
    : subscription?.id;
  
  if (subscriptionId) {
    console.log(`Payment failed for subscription: ${subscriptionId}`);
    // TODO: Handle failed payment, send notification, etc.
  }
}