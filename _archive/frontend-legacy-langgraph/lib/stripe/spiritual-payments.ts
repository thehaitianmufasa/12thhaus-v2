/**
 * 12thhaus Spiritual Platform - Stripe Payment Integration
 * Handles payments for spiritual services and practitioner payouts
 */

import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

// Frontend Stripe instance
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Spiritual service pricing configuration
export const SPIRITUAL_PLATFORM_CONFIG = {
  platformFeePercentage: parseInt(process.env.STRIPE_PLATFORM_FEE_PERCENTAGE || '10'),
  currency: 'usd',
  minimumAmount: 500, // $5.00 minimum
  maximumAmount: 50000, // $500.00 maximum per session
  
  // Spiritual service categories with suggested pricing
  servicePricing: {
    tarot: { min: 2500, max: 15000, suggested: 7500 }, // $25-150, suggested $75
    astrology: { min: 5000, max: 25000, suggested: 12000 }, // $50-250, suggested $120
    reiki: { min: 3000, max: 12000, suggested: 8000 }, // $30-120, suggested $80
    life_coaching: { min: 5000, max: 30000, suggested: 15000 }, // $50-300, suggested $150
    meditation: { min: 2000, max: 10000, suggested: 6000 }, // $20-100, suggested $60
    energy_healing: { min: 4000, max: 20000, suggested: 10000 }, // $40-200, suggested $100
    crystal_healing: { min: 3000, max: 15000, suggested: 9000 }, // $30-150, suggested $90
    numerology: { min: 3500, max: 12000, suggested: 7500 }, // $35-120, suggested $75
    chakra_balancing: { min: 4000, max: 18000, suggested: 11000 }, // $40-180, suggested $110
    spiritual_counseling: { min: 6000, max: 35000, suggested: 18000 } // $60-350, suggested $180
  }
}

export interface SpiritualBookingPayment {
  bookingId: string
  practitionerId: string
  seekerId: string
  serviceId: string
  amount: number
  currency: string
  platformFee: number
  practitionerEarnings: number
  description: string
  metadata: {
    serviceName: string
    serviceCategory: string
    sessionDuration: number
    scheduledAt: string
  }
}

export interface PractitionerPayoutData {
  practitionerId: string
  stripeAccountId: string
  periodStart: string
  periodEnd: string
  totalSessions: number
  grossEarnings: number
  platformFees: number
  netEarnings: number
}

/**
 * Spiritual Service Payment Processing
 */
export class SpiritualPaymentProcessor {
  
  /**
   * Create payment intent for spiritual service booking
   */
  static async createBookingPaymentIntent(paymentData: SpiritualBookingPayment): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method_types: ['card'],
        capture_method: 'manual', // Hold payment until session completion
        description: paymentData.description,
        metadata: {
          booking_id: paymentData.bookingId,
          practitioner_id: paymentData.practitionerId,
          seeker_id: paymentData.seekerId,
          service_id: paymentData.serviceId,
          service_name: paymentData.metadata.serviceName,
          service_category: paymentData.metadata.serviceCategory,
          session_duration: paymentData.metadata.sessionDuration.toString(),
          scheduled_at: paymentData.metadata.scheduledAt,
          platform_fee: paymentData.platformFee.toString(),
          practitioner_earnings: paymentData.practitionerEarnings.toString(),
          spiritual_platform: '12thhaus'
        },
        receipt_email: undefined, // Will be set from booking data
        statement_descriptor: '12THHAUS SPIRITUAL',
        statement_descriptor_suffix: paymentData.metadata.serviceCategory.toUpperCase().substring(0, 8)
      })

      return paymentIntent
    } catch (error) {
      console.error('Error creating spiritual service payment intent:', error)
      throw new Error('Failed to create payment intent for spiritual service')
    }
  }

  /**
   * Capture payment after successful spiritual session
   */
  static async captureBookingPayment(paymentIntentId: string, practitionerStripeAccountId: string): Promise<Stripe.PaymentIntent> {
    try {
      // First capture the payment
      const capturedPayment = await stripe.paymentIntents.capture(paymentIntentId)

      // Calculate platform fee and practitioner earnings
      const totalAmount = capturedPayment.amount
      const platformFee = Math.round(totalAmount * (SPIRITUAL_PLATFORM_CONFIG.platformFeePercentage / 100))
      const practitionerEarnings = totalAmount - platformFee

      // Create transfer to practitioner (if they have connected account)
      if (practitionerStripeAccountId && practitionerEarnings > 0) {
        await stripe.transfers.create({
          amount: practitionerEarnings,
          currency: capturedPayment.currency,
          destination: practitionerStripeAccountId,
          description: `Spiritual service earnings - ${capturedPayment.metadata.service_name}`,
          metadata: {
            booking_id: capturedPayment.metadata.booking_id,
            service_category: capturedPayment.metadata.service_category,
            original_payment_intent: paymentIntentId
          }
        })
      }

      return capturedPayment
    } catch (error) {
      console.error('Error capturing spiritual service payment:', error)
      throw new Error('Failed to capture payment for spiritual service')
    }
  }

  /**
   * Refund spiritual service payment
   */
  static async refundBookingPayment(
    paymentIntentId: string, 
    refundAmount?: number,
    reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer'
  ): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: refundAmount, // If not provided, refunds full amount
        reason,
        metadata: {
          spiritual_platform: '12thhaus',
          refund_reason: reason
        }
      })

      return refund
    } catch (error) {
      console.error('Error refunding spiritual service payment:', error)
      throw new Error('Failed to process refund for spiritual service')
    }
  }

  /**
   * Calculate pricing for spiritual service
   */
  static calculateServicePricing(serviceCategory: string, basePriceInCents: number): {
    amount: number,
    platformFee: number,
    practitionerEarnings: number,
    suggestedPrice?: number
  } {
    const categoryPricing = SPIRITUAL_PLATFORM_CONFIG.servicePricing[serviceCategory as keyof typeof SPIRITUAL_PLATFORM_CONFIG.servicePricing]
    
    // Validate amount within category limits
    let amount = basePriceInCents
    if (categoryPricing) {
      amount = Math.max(categoryPricing.min, Math.min(categoryPricing.max, basePriceInCents))
    }
    
    // Ensure within platform limits
    amount = Math.max(SPIRITUAL_PLATFORM_CONFIG.minimumAmount, Math.min(SPIRITUAL_PLATFORM_CONFIG.maximumAmount, amount))
    
    const platformFee = Math.round(amount * (SPIRITUAL_PLATFORM_CONFIG.platformFeePercentage / 100))
    const practitionerEarnings = amount - platformFee

    return {
      amount,
      platformFee,
      practitionerEarnings,
      suggestedPrice: categoryPricing?.suggested
    }
  }

  /**
   * Create Stripe Connect account for practitioner
   */
  static async createPractitionerAccount(practitionerData: {
    email: string
    firstName: string
    lastName: string
    phone?: string
    country: string
    businessType: 'individual' | 'company'
  }): Promise<Stripe.Account> {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: practitionerData.country,
        email: practitionerData.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        business_type: practitionerData.businessType,
        individual: practitionerData.businessType === 'individual' ? {
          email: practitionerData.email,
          first_name: practitionerData.firstName,
          last_name: practitionerData.lastName,
          phone: practitionerData.phone
        } : undefined,
        metadata: {
          spiritual_platform: '12thhaus',
          account_type: 'practitioner'
        }
      })

      return account
    } catch (error) {
      console.error('Error creating practitioner Stripe account:', error)
      throw new Error('Failed to create payment account for practitioner')
    }
  }

  /**
   * Create account link for practitioner onboarding
   */
  static async createPractitionerAccountLink(accountId: string, returnUrl: string, refreshUrl: string): Promise<Stripe.AccountLink> {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding'
      })

      return accountLink
    } catch (error) {
      console.error('Error creating practitioner account link:', error)
      throw new Error('Failed to create onboarding link for practitioner')
    }
  }

  /**
   * Get practitioner account status
   */
  static async getPractitionerAccountStatus(accountId: string): Promise<{
    isActive: boolean,
    canReceivePayments: boolean,
    requiresAction: boolean,
    requirements: string[]
  }> {
    try {
      const account = await stripe.accounts.retrieve(accountId)
      
      return {
        isActive: account.details_submitted === true && account.charges_enabled === true,
        canReceivePayments: account.payouts_enabled === true,
        requiresAction: (account.requirements?.currently_due?.length || 0) > 0,
        requirements: account.requirements?.currently_due || []
      }
    } catch (error) {
      console.error('Error retrieving practitioner account status:', error)
      throw new Error('Failed to retrieve practitioner account status')
    }
  }

  /**
   * Process batch practitioner payouts
   */
  static async processPractitionerPayouts(payouts: PractitionerPayoutData[]): Promise<{
    successful: string[],
    failed: { practitionerId: string, error: string }[]
  }> {
    const successful: string[] = []
    const failed: { practitionerId: string, error: string }[] = []

    for (const payout of payouts) {
      try {
        // Only process if there are net earnings
        if (payout.netEarnings <= 0) {
          continue
        }

        await stripe.payouts.create({
          amount: Math.round(payout.netEarnings),
          currency: SPIRITUAL_PLATFORM_CONFIG.currency,
          description: `12thhaus spiritual services payout - ${payout.periodStart} to ${payout.periodEnd}`,
          metadata: {
            practitioner_id: payout.practitionerId,
            period_start: payout.periodStart,
            period_end: payout.periodEnd,
            total_sessions: payout.totalSessions.toString(),
            gross_earnings: payout.grossEarnings.toString(),
            platform_fees: payout.platformFees.toString()
          }
        }, {
          stripeAccount: payout.stripeAccountId
        })

        successful.push(payout.practitionerId)
      } catch (error) {
        console.error(`Error processing payout for practitioner ${payout.practitionerId}:`, error)
        failed.push({
          practitionerId: payout.practitionerId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return { successful, failed }
  }
}

/**
 * Spiritual Platform Subscription Management
 */
export class SpiritualSubscriptionManager {
  
  /**
   * Create subscription for practitioner premium features
   */
  static async createPractitionerSubscription(
    customerId: string,
    priceId: string,
    practitionerId: string
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          practitioner_id: practitionerId,
          subscription_type: 'practitioner_premium',
          spiritual_platform: '12thhaus'
        }
      })

      return subscription
    } catch (error) {
      console.error('Error creating practitioner subscription:', error)
      throw new Error('Failed to create practitioner subscription')
    }
  }

  /**
   * Update practitioner subscription
   */
  static async updatePractitionerSubscription(
    subscriptionId: string,
    newPriceId: string
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId
        }],
        proration_behavior: 'create_prorations'
      })

      return updatedSubscription
    } catch (error) {
      console.error('Error updating practitioner subscription:', error)
      throw new Error('Failed to update practitioner subscription')
    }
  }
}

export default SpiritualPaymentProcessor