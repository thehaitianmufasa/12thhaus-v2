// ============================================================================
// 12THHAUS v2.0 STRIPE CONNECT PAYMENT INTEGRATION
// Add to server.js for complete payment processing functionality
// ============================================================================

// Add at the top with other imports:
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Set STRIPE_SECRET_KEY in environment variables

// Add these payment-related GraphQL types to the schema:
const paymentTypes = `
  # Stripe Connect Account for Practitioners
  type StripeConnectAccount {
    id: String!
    practitioner_id: String!
    stripe_account_id: String!
    account_type: String!
    account_status: String!
    onboarding_completed: Boolean!
    onboarding_url: String
    payouts_enabled: Boolean!
    charges_enabled: Boolean!
    details_submitted: Boolean!
    country: String
    default_currency: String
    business_name: String
    business_type: String
    created_at: String!
    updated_at: String!
    # Relationships
    practitioner: Practitioner
  }

  # Payment Intent for Booking Payments
  type PaymentIntent {
    id: String!
    booking_id: String!
    stripe_payment_intent_id: String!
    amount: Int! # Amount in cents
    currency: String!
    platform_fee: Int! # Platform fee in cents
    practitioner_amount: Int! # Amount practitioner receives
    payment_status: String!
    client_secret: String!
    payment_method_id: String
    receipt_email: String
    description: String
    created_at: String!
    updated_at: String!
    # Relationships
    booking: SpiritualBooking
  }

  # Payment Transaction Record
  type PaymentTransaction {
    id: String!
    payment_intent_id: String!
    booking_id: String!
    practitioner_id: String!
    seeker_id: String!
    stripe_charge_id: String
    stripe_transfer_id: String
    total_amount: Int!
    platform_fee: Int!
    practitioner_amount: Int!
    processing_fee: Int
    transaction_status: String!
    charged_at: String
    transferred_at: String
    currency: String!
    description: String
    created_at: String!
    # Relationships
    payment_intent: PaymentIntent
    booking: SpiritualBooking
    practitioner: Practitioner
    seeker: User
  }

  # Payment Refund Record
  type PaymentRefund {
    id: String!
    payment_transaction_id: String!
    booking_id: String!
    stripe_refund_id: String!
    refund_amount: Int!
    platform_fee_refund: Int
    practitioner_refund: Int
    refund_reason: String
    refund_status: String!
    initiated_by: String!
    initiator_id: String
    reason_description: String
    processed_at: String
    created_at: String!
    # Relationships
    payment_transaction: PaymentTransaction
    booking: SpiritualBooking
  }

  # Input types for payment operations
  input StripeConnectOnboardingInput {
    practitioner_id: String!
    account_type: String = "express"
    country: String = "US"
    refresh_url: String!
    return_url: String!
  }

  input PaymentIntentInput {
    booking_id: String!
    payment_method_id: String
    receipt_email: String
    save_payment_method: Boolean = false
  }

  input RefundInput {
    payment_transaction_id: String!
    refund_amount: Int # If not provided, full refund
    reason: String!
    reason_description: String
  }
`;

// Add these payment queries to Query type:
const paymentQueries = `
    # Payment-related queries
    stripe_connect_account(practitioner_id: String!): StripeConnectAccount
    payment_intent(id: String!): PaymentIntent
    payment_transaction(id: String!): PaymentTransaction
    my_payment_transactions(as_practitioner: Boolean = false): [PaymentTransaction!]!
    booking_payment_status(booking_id: String!): PaymentIntent
`;

// Add these payment mutations to Mutation type:
const paymentMutations = `
    # Stripe Connect & Payment Processing
    create_stripe_connect_account(input: StripeConnectOnboardingInput!): StripeConnectAccount!
    refresh_stripe_onboarding_link(practitioner_id: String!): StripeConnectAccount!
    create_payment_intent(input: PaymentIntentInput!): PaymentIntent!
    confirm_payment_intent(payment_intent_id: String!, payment_method_id: String!): PaymentIntent!
    request_refund(input: RefundInput!): PaymentRefund!
    update_payment_status(booking_id: String!, status: String!): SpiritualBooking!
`;

// Add these payment resolvers:
const paymentResolvers = {
  Query: {
    // Get Stripe Connect account for practitioner
    stripe_connect_account: async (parent, { practitioner_id }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        // Verify practitioner owns this account or is admin
        const practitionerCheck = await client.query(
          'SELECT user_id FROM twelthhaus.practitioners WHERE id = $1',
          [practitioner_id]
        );
        
        if (!practitionerCheck.rows[0] || 
            (practitionerCheck.rows[0].user_id !== authUser.userId && authUser.userType !== 'admin')) {
          throw new Error('Unauthorized to view this Connect account');
        }
        
        const result = await client.query(
          'SELECT * FROM twelthhaus.stripe_connect_accounts WHERE practitioner_id = $1',
          [practitioner_id]
        );
        
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    // Get payment intent details
    payment_intent: async (parent, { id }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        const result = await client.query(`
          SELECT pi.*, sb.seeker_id, sb.practitioner_id 
          FROM twelthhaus.payment_intents pi
          JOIN twelthhaus.spiritual_bookings sb ON pi.booking_id = sb.id
          WHERE pi.id = $1
        `, [id]);
        
        if (!result.rows[0]) {
          throw new Error('Payment intent not found');
        }
        
        const paymentIntent = result.rows[0];
        
        // Verify user has access to this payment intent
        if (paymentIntent.seeker_id !== authUser.userId && 
            paymentIntent.practitioner_id !== authUser.userId &&
            authUser.userType !== 'admin') {
          throw new Error('Unauthorized to view this payment intent');
        }
        
        return paymentIntent;
      } finally {
        client.release();
      }
    },

    // Get user's payment transactions
    my_payment_transactions: async (parent, { as_practitioner }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        const userColumn = as_practitioner ? 'practitioner_id' : 'seeker_id';
        const result = await client.query(`
          SELECT * FROM twelthhaus.payment_transactions 
          WHERE ${userColumn} = $1 
          ORDER BY created_at DESC
        `, [authUser.userId]);
        
        return result.rows;
      } finally {
        client.release();
      }
    },

    // Get payment status for a booking
    booking_payment_status: async (parent, { booking_id }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        // Verify user has access to this booking
        const bookingCheck = await client.query(
          'SELECT seeker_id, practitioner_id FROM twelthhaus.spiritual_bookings WHERE id = $1',
          [booking_id]
        );
        
        if (!bookingCheck.rows[0] || 
            (bookingCheck.rows[0].seeker_id !== authUser.userId && 
             bookingCheck.rows[0].practitioner_id !== authUser.userId)) {
          throw new Error('Unauthorized to view this booking payment status');
        }
        
        const result = await client.query(
          'SELECT * FROM twelthhaus.payment_intents WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1',
          [booking_id]
        );
        
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  },

  Mutation: {
    // Create Stripe Connect account and onboarding link
    create_stripe_connect_account: async (parent, { input }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Verify user is the practitioner or admin
        const practitionerCheck = await client.query(
          'SELECT user_id FROM twelthhaus.practitioners WHERE id = $1',
          [input.practitioner_id]
        );
        
        if (!practitionerCheck.rows[0] || 
            (practitionerCheck.rows[0].user_id !== authUser.userId && authUser.userType !== 'admin')) {
          throw new Error('Unauthorized to create Connect account for this practitioner');
        }
        
        // Check if account already exists
        const existingAccount = await client.query(
          'SELECT * FROM twelthhaus.stripe_connect_accounts WHERE practitioner_id = $1',
          [input.practitioner_id]
        );
        
        if (existingAccount.rows[0]) {
          throw new Error('Stripe Connect account already exists for this practitioner');
        }
        
        // Create Stripe Connect Express account
        const account = await stripe.accounts.create({
          type: input.account_type,
          country: input.country,
          capabilities: {
            transfers: { requested: true },
            card_payments: { requested: true }
          }
        });
        
        // Create onboarding link
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: input.refresh_url,
          return_url: input.return_url,
          type: 'account_onboarding'
        });
        
        // Store account info in database
        const result = await client.query(`
          INSERT INTO twelthhaus.stripe_connect_accounts 
          (practitioner_id, stripe_account_id, account_type, account_status, 
           onboarding_completed, onboarding_url, payouts_enabled, charges_enabled, 
           details_submitted, country, default_currency)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
          input.practitioner_id,
          account.id,
          account.type,
          'pending',
          false,
          accountLink.url,
          false,
          false,
          false,
          input.country,
          'USD'
        ]);
        
        await client.query('COMMIT');
        return result.rows[0];
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating Stripe Connect account:', error);
        throw new Error('Failed to create Stripe Connect account: ' + error.message);
      } finally {
        client.release();
      }
    },

    // Create payment intent for booking
    create_payment_intent: async (parent, { input }, context) => {
      const authUser = getAuthenticatedUser(context);
      
      if (authUser.userType !== 'seeker') {
        throw new Error('Only seekers can create payment intents');
      }
      
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Get booking details
        const bookingResult = await client.query(`
          SELECT sb.*, p.id as practitioner_id, sca.stripe_account_id
          FROM twelthhaus.spiritual_bookings sb
          JOIN twelthhaus.practitioners p ON sb.practitioner_id = p.id::text
          LEFT JOIN twelthhaus.stripe_connect_accounts sca ON p.id = sca.practitioner_id
          WHERE sb.id = $1 AND sb.seeker_id = $2
        `, [input.booking_id, authUser.userId]);
        
        if (!bookingResult.rows[0]) {
          throw new Error('Booking not found or unauthorized');
        }
        
        const booking = bookingResult.rows[0];
        
        if (!booking.stripe_account_id) {
          throw new Error('Practitioner has not completed Stripe Connect setup');
        }
        
        // Calculate amounts
        const totalAmount = Math.round(booking.agreed_price * 100); // Convert to cents
        const platformFeePercentage = 5.0; // 5% platform fee
        const platformFee = Math.round(totalAmount * (platformFeePercentage / 100));
        const practitionerAmount = totalAmount - platformFee;
        
        // Create Stripe PaymentIntent with application fee
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalAmount,
          currency: 'usd',
          application_fee_amount: platformFee,
          transfer_data: {
            destination: booking.stripe_account_id
          },
          metadata: {
            booking_id: input.booking_id,
            practitioner_id: booking.practitioner_id,
            seeker_id: authUser.userId
          },
          receipt_email: input.receipt_email,
          description: `12thhaus Spiritual Session - ${booking.agreed_price}`
        });
        
        // Store payment intent in database
        const result = await client.query(`
          INSERT INTO twelthhaus.payment_intents 
          (booking_id, stripe_payment_intent_id, amount, currency, 
           platform_fee, practitioner_amount, payment_status, client_secret,
           payment_method_id, receipt_email, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
          input.booking_id,
          paymentIntent.id,
          totalAmount,
          'USD',
          platformFee,
          practitionerAmount,
          paymentIntent.status,
          paymentIntent.client_secret,
          input.payment_method_id,
          input.receipt_email,
          paymentIntent.description
        ]);
        
        await client.query('COMMIT');
        return result.rows[0];
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating payment intent:', error);
        throw new Error('Failed to create payment intent: ' + error.message);
      } finally {
        client.release();
      }
    },

    // Request refund for completed payment
    request_refund: async (parent, { input }, context) => {
      const authUser = getAuthenticatedUser(context);
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Get payment transaction details
        const transactionResult = await client.query(`
          SELECT pt.*, sb.seeker_id, sb.practitioner_id, sb.booking_status
          FROM twelthhaus.payment_transactions pt
          JOIN twelthhaus.spiritual_bookings sb ON pt.booking_id = sb.id
          WHERE pt.id = $1
        `, [input.payment_transaction_id]);
        
        if (!transactionResult.rows[0]) {
          throw new Error('Payment transaction not found');
        }
        
        const transaction = transactionResult.rows[0];
        
        // Verify authorization - seeker, practitioner, or admin can request refunds
        if (transaction.seeker_id !== authUser.userId && 
            transaction.practitioner_id !== authUser.userId &&
            authUser.userType !== 'admin') {
          throw new Error('Unauthorized to request refund for this transaction');
        }
        
        if (transaction.transaction_status !== 'completed') {
          throw new Error('Can only refund completed transactions');
        }
        
        // Determine refund amount
        const refundAmount = input.refund_amount || transaction.total_amount;
        
        if (refundAmount > transaction.total_amount) {
          throw new Error('Refund amount cannot exceed original transaction amount');
        }
        
        // Create Stripe refund
        const refund = await stripe.refunds.create({
          charge: transaction.stripe_charge_id,
          amount: refundAmount,
          reason: input.reason === 'requested_by_customer' ? 'requested_by_customer' : 'duplicate',
          metadata: {
            booking_id: transaction.booking_id,
            initiated_by: authUser.userId,
            reason: input.reason
          }
        });
        
        // Calculate refund distribution
        const platformFeeRefund = Math.round(refundAmount * (transaction.platform_fee / transaction.total_amount));
        const practitionerRefund = refundAmount - platformFeeRefund;
        
        // Store refund record
        const result = await client.query(`
          INSERT INTO twelthhaus.payment_refunds 
          (payment_transaction_id, booking_id, stripe_refund_id, refund_amount,
           platform_fee_refund, practitioner_refund, refund_reason, refund_status,
           initiated_by, initiator_id, reason_description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
          input.payment_transaction_id,
          transaction.booking_id,
          refund.id,
          refundAmount,
          platformFeeRefund,
          practitionerRefund,
          input.reason,
          refund.status,
          authUser.userType,
          authUser.userId,
          input.reason_description
        ]);
        
        // Update booking status if full refund
        if (refundAmount === transaction.total_amount) {
          await client.query(
            'UPDATE twelthhaus.spiritual_bookings SET payment_status = $1, booking_status = $2 WHERE id = $3',
            ['refunded', 'cancelled', transaction.booking_id]
          );
        }
        
        await client.query('COMMIT');
        return result.rows[0];
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing refund:', error);
        throw new Error('Failed to process refund: ' + error.message);
      } finally {
        client.release();
      }
    }
  },

  // Relationship resolvers
  StripeConnectAccount: {
    practitioner: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.practitioners WHERE id = $1',
          [parent.practitioner_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  },

  PaymentIntent: {
    booking: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.spiritual_bookings WHERE id = $1',
          [parent.booking_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  },

  PaymentTransaction: {
    payment_intent: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.payment_intents WHERE id = $1',
          [parent.payment_intent_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    booking: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.spiritual_bookings WHERE id = $1',
          [parent.booking_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    practitioner: async (parent) => {
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM twelthhaus.practitioners WHERE id = $1',
          [parent.practitioner_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
    
    seeker: async (parent) => {
      const client = await pool.connect();
      try {  
        const result = await client.query(
          'SELECT * FROM twelthhaus.users WHERE id = $1',
          [parent.seeker_id]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    }
  }
};

// Webhook handler for Stripe events (add to Express app)
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...';
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  const client = await pool.connect();
  
  try {
    // Log webhook event
    await client.query(`
      INSERT INTO twelthhaus.stripe_webhooks 
      (stripe_event_id, event_type, api_version, event_data, 
       related_object_id, related_account_id, signature_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      event.id,
      event.type,
      event.api_version,
      JSON.stringify(event.data),
      event.data.object.id,
      event.account || null,
      true
    ]);
    
    // Handle specific webhook events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object, client);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object, client);
        break;
        
      case 'account.updated':
        await handleConnectAccountUpdated(event.data.object, client);
        break;
        
      case 'transfer.created':
        await handleTransferCreated(event.data.object, client);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Mark webhook as processed
    await client.query(
      'UPDATE twelthhaus.stripe_webhooks SET processed = true, processed_at = CURRENT_TIMESTAMP WHERE stripe_event_id = $1',
      [event.id]
    );
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Log error in webhook record
    await client.query(
      'UPDATE twelthhaus.stripe_webhooks SET processing_error = $1, retry_count = retry_count + 1 WHERE stripe_event_id = $2',
      [error.message, event.id]
    );
    
    return res.status(500).send('Webhook processing failed');
  } finally {
    client.release();
  }
  
  res.json({ received: true });
};

// Webhook event handlers
const handlePaymentIntentSucceeded = async (paymentIntent, client) => {
  try {
    // Update payment intent status
    await client.query(
      'UPDATE twelthhaus.payment_intents SET payment_status = $1 WHERE stripe_payment_intent_id = $2',
      ['succeeded', paymentIntent.id]
    );
    
    // Create payment transaction record
    const booking_id = paymentIntent.metadata.booking_id;
    const practitioner_id = paymentIntent.metadata.practitioner_id;
    const seeker_id = paymentIntent.metadata.seeker_id;
    
    await client.query(`
      INSERT INTO twelthhaus.payment_transactions 
      (payment_intent_id, booking_id, practitioner_id, seeker_id,
       stripe_charge_id, total_amount, platform_fee, practitioner_amount,
       transaction_status, charged_at, currency, description)
      SELECT 
        pi.id, pi.booking_id, $1, $2,
        $3, pi.amount, pi.platform_fee, pi.practitioner_amount,
        'completed', CURRENT_TIMESTAMP, pi.currency, pi.description
      FROM twelthhaus.payment_intents pi
      WHERE pi.stripe_payment_intent_id = $4
    `, [practitioner_id, seeker_id, paymentIntent.latest_charge, paymentIntent.id]);
    
    // Update booking payment status
    if (booking_id) {
      await client.query(
        'UPDATE twelthhaus.spiritual_bookings SET payment_status = $1, booking_status = $2 WHERE id = $3',
        ['paid', 'confirmed', booking_id]
      );
    }
    
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error);
    throw error;
  }
};

const handlePaymentIntentFailed = async (paymentIntent, client) => {
  try {
    await client.query(
      'UPDATE twelthhaus.payment_intents SET payment_status = $1, last_payment_error = $2 WHERE stripe_payment_intent_id = $3',
      ['failed', JSON.stringify(paymentIntent.last_payment_error), paymentIntent.id]
    );
    
    // Update booking payment status
    const booking_id = paymentIntent.metadata.booking_id;
    if (booking_id) {
      await client.query(
        'UPDATE twelthhaus.spiritual_bookings SET payment_status = $1 WHERE id = $2',
        ['failed', booking_id]
      );
    }
    
  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error);
    throw error;
  }
};

const handleConnectAccountUpdated = async (account, client) => {
  try {
    await client.query(`
      UPDATE twelthhaus.stripe_connect_accounts 
      SET account_status = $1, onboarding_completed = $2, 
          payouts_enabled = $3, charges_enabled = $4, details_submitted = $5
      WHERE stripe_account_id = $6
    `, [
      account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
      account.details_submitted,
      account.payouts_enabled,
      account.charges_enabled,
      account.details_submitted,
      account.id
    ]);
    
  } catch (error) {
    console.error('Error handling account.updated:', error);
    throw error;
  }
};

const handleTransferCreated = async (transfer, client) => {
  try {
    // Update payment transaction with transfer ID
    await client.query(
      'UPDATE twelthhaus.payment_transactions SET stripe_transfer_id = $1, transferred_at = CURRENT_TIMESTAMP WHERE stripe_charge_id = $2',
      [transfer.id, transfer.source_transaction]
    );
    
  } catch (error) {
    console.error('Error handling transfer.created:', error);
    throw error;
  }
};

module.exports = {
  paymentTypes,
  paymentQueries,
  paymentMutations,
  paymentResolvers,
  handleStripeWebhook
};