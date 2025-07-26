-- ============================================================================
-- 12THHAUS v2.0 PAYMENT INTEGRATION SCHEMA - CORRECTED VERSION
-- Stripe Connect Implementation for Spiritual Services Marketplace
-- ============================================================================

-- Drop existing tables with incorrect foreign key types
DROP TABLE IF EXISTS twelthhaus.stripe_webhooks CASCADE;
DROP TABLE IF EXISTS twelthhaus.payout_schedules CASCADE;
DROP TABLE IF EXISTS twelthhaus.payment_disputes CASCADE;
DROP TABLE IF EXISTS twelthhaus.payment_refunds CASCADE;
DROP TABLE IF EXISTS twelthhaus.payment_transactions CASCADE;
DROP TABLE IF EXISTS twelthhaus.payment_intents CASCADE;
DROP TABLE IF EXISTS twelthhaus.stripe_connect_accounts CASCADE;

-- ============================================================================
-- 1. STRIPE CONNECT ACCOUNTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS twelthhaus.stripe_connect_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id TEXT NOT NULL, -- TEXT to match practitioners.id
    stripe_account_id VARCHAR(255) NOT NULL UNIQUE, -- Stripe Connect account ID (acct_xxx)
    account_type VARCHAR(20) NOT NULL DEFAULT 'express', -- 'express' or 'custom'
    account_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'restricted', 'inactive'
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_url TEXT, -- Stripe Connect onboarding URL
    payouts_enabled BOOLEAN DEFAULT FALSE,
    charges_enabled BOOLEAN DEFAULT FALSE,
    details_submitted BOOLEAN DEFAULT FALSE,
    country VARCHAR(2) DEFAULT 'US', -- ISO country code
    default_currency VARCHAR(3) DEFAULT 'USD',
    business_name VARCHAR(255),
    business_type VARCHAR(50), -- 'individual', 'company', 'non_profit', 'government_entity'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (practitioner_id) REFERENCES twelthhaus.practitioners(id) ON DELETE CASCADE
);

-- ============================================================================
-- 2. PAYMENT INTENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS twelthhaus.payment_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL, -- UUID to match spiritual_bookings.id
    stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE, -- pi_xxx
    amount INTEGER NOT NULL, -- Amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    platform_fee INTEGER NOT NULL, -- Platform fee in cents (5% of amount)
    practitioner_amount INTEGER NOT NULL, -- Amount practitioner receives (amount - platform_fee)
    payment_status VARCHAR(50) NOT NULL DEFAULT 'requires_payment_method',
    -- Payment statuses: requires_payment_method, requires_confirmation, requires_action,
    -- processing, requires_capture, canceled, succeeded
    client_secret TEXT NOT NULL, -- For frontend integration
    payment_method_id VARCHAR(255), -- pm_xxx
    capture_method VARCHAR(20) DEFAULT 'automatic', -- 'automatic' or 'manual'
    confirmation_method VARCHAR(20) DEFAULT 'automatic', -- 'automatic' or 'manual'
    setup_future_usage VARCHAR(20), -- 'on_session', 'off_session'
    receipt_email VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}', -- Additional Stripe metadata
    last_payment_error JSONB, -- Last payment error details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (booking_id) REFERENCES twelthhaus.spiritual_bookings(id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. PAYMENT TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS twelthhaus.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_intent_id UUID NOT NULL,
    booking_id UUID NOT NULL,
    practitioner_id TEXT NOT NULL, -- TEXT to match practitioners.id
    seeker_id TEXT NOT NULL, -- TEXT to match users.id (seekers are users with user_type='seeker')
    
    -- Stripe IDs
    stripe_charge_id VARCHAR(255), -- ch_xxx
    stripe_transfer_id VARCHAR(255), -- tr_xxx (transfer to practitioner)
    stripe_payout_id VARCHAR(255), -- po_xxx (payout to practitioner bank)
    
    -- Transaction amounts (all in cents)
    total_amount INTEGER NOT NULL,
    platform_fee INTEGER NOT NULL,
    practitioner_amount INTEGER NOT NULL,
    processing_fee INTEGER, -- Stripe processing fee
    net_platform_revenue INTEGER, -- Platform fee minus processing costs
    
    -- Transaction status
    transaction_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Statuses: pending, completed, failed, refunded, disputed, canceled
    
    -- Timing
    charged_at TIMESTAMP,
    transferred_at TIMESTAMP,
    paid_out_at TIMESTAMP,
    
    -- Additional details
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    description TEXT,
    failure_reason TEXT,
    refund_reason TEXT,
    dispute_reason TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (payment_intent_id) REFERENCES twelthhaus.payment_intents(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES twelthhaus.spiritual_bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (practitioner_id) REFERENCES twelthhaus.practitioners(id) ON DELETE CASCADE,
    FOREIGN KEY (seeker_id) REFERENCES twelthhaus.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 4. REFUNDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS twelthhaus.payment_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_transaction_id UUID NOT NULL,
    booking_id UUID NOT NULL,
    stripe_refund_id VARCHAR(255) NOT NULL UNIQUE, -- re_xxx
    
    -- Refund details
    refund_amount INTEGER NOT NULL, -- Amount refunded in cents
    platform_fee_refund INTEGER, -- Platform fee portion refunded
    practitioner_refund INTEGER, -- Amount deducted from practitioner
    refund_reason VARCHAR(100), -- 'duplicate', 'fraudulent', 'requested_by_customer'
    refund_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Statuses: pending, succeeded, failed, canceled
    
    -- Who initiated the refund
    initiated_by VARCHAR(20) NOT NULL, -- 'seeker', 'practitioner', 'admin', 'system'
    initiator_id TEXT, -- ID of the user who initiated refund (matches users.id)
    
    -- Refund details
    reason_description TEXT,
    admin_notes TEXT,
    processed_at TIMESTAMP,
    failure_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (payment_transaction_id) REFERENCES twelthhaus.payment_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES twelthhaus.spiritual_bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (initiator_id) REFERENCES twelthhaus.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 5. DISPUTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS twelthhaus.payment_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_transaction_id UUID NOT NULL,
    booking_id UUID NOT NULL,
    stripe_dispute_id VARCHAR(255) NOT NULL UNIQUE, -- dp_xxx
    
    -- Dispute details
    dispute_amount INTEGER NOT NULL, -- Disputed amount in cents
    dispute_reason VARCHAR(100), -- 'duplicate', 'fraudulent', 'subscription_canceled', etc.
    dispute_status VARCHAR(50) NOT NULL,
    -- Statuses: warning_needs_response, warning_under_review, warning_closed,
    -- needs_response, under_review, charge_refunded, won, lost
    
    -- Evidence and response
    evidence_due_by TIMESTAMP,
    evidence_submitted BOOLEAN DEFAULT FALSE,
    evidence_details JSONB DEFAULT '{}',
    response_notes TEXT,
    outcome VARCHAR(50), -- 'won', 'lost', 'accepted'
    
    -- Financial impact
    dispute_fee INTEGER, -- Stripe dispute fee (usually $15)
    fee_refunded BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (payment_transaction_id) REFERENCES twelthhaus.payment_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES twelthhaus.spiritual_bookings(id) ON DELETE CASCADE
);

-- ============================================================================
-- 6. PAYOUT SCHEDULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS twelthhaus.payout_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id TEXT NOT NULL, -- TEXT to match practitioners.id
    stripe_account_id VARCHAR(255) NOT NULL,
    
    -- Payout schedule settings
    interval_type VARCHAR(20) NOT NULL DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly', 'manual'
    weekly_anchor VARCHAR(10), -- 'monday', 'tuesday', etc. for weekly payouts
    monthly_anchor INTEGER, -- Day of month (1-31) for monthly payouts
    delay_days INTEGER DEFAULT 2, -- Days to hold funds before payout
    
    -- Minimum payout amount
    minimum_payout_amount INTEGER DEFAULT 1000, -- $10.00 minimum
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_payout_date DATE,
    next_payout_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (practitioner_id) REFERENCES twelthhaus.practitioners(id) ON DELETE CASCADE,
    FOREIGN KEY (stripe_account_id) REFERENCES twelthhaus.stripe_connect_accounts(stripe_account_id) ON DELETE CASCADE
);

-- ============================================================================
-- 7. PAYMENT WEBHOOKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS twelthhaus.stripe_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id VARCHAR(255) NOT NULL UNIQUE, -- evt_xxx
    event_type VARCHAR(100) NOT NULL, -- 'payment_intent.succeeded', 'account.updated', etc.
    api_version VARCHAR(20),
    
    -- Event data
    event_data JSONB NOT NULL,
    related_object_id VARCHAR(255), -- ID of related Stripe object
    related_account_id VARCHAR(255), -- Connect account ID if applicable
    
    -- Processing status
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    processing_error TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Webhook signature verification
    webhook_signature TEXT,
    signature_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. PLATFORM SETTINGS TABLE (if it doesn't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS twelthhaus.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) NOT NULL DEFAULT 'string', -- 'string', 'integer', 'decimal', 'boolean'
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Whether setting can be accessed by clients
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Stripe Connect Accounts indexes
CREATE INDEX IF NOT EXISTS idx_stripe_connect_accounts_practitioner 
ON twelthhaus.stripe_connect_accounts(practitioner_id);

CREATE INDEX IF NOT EXISTS idx_stripe_connect_accounts_stripe_id 
ON twelthhaus.stripe_connect_accounts(stripe_account_id);

CREATE INDEX IF NOT EXISTS idx_stripe_connect_accounts_status 
ON twelthhaus.stripe_connect_accounts(account_status);

-- Payment Intents indexes
CREATE INDEX IF NOT EXISTS idx_payment_intents_booking 
ON twelthhaus.payment_intents(booking_id);

CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe_id 
ON twelthhaus.payment_intents(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_payment_intents_status 
ON twelthhaus.payment_intents(payment_status);

-- Payment Transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_intent 
ON twelthhaus.payment_transactions(payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking 
ON twelthhaus.payment_transactions(booking_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_practitioner 
ON twelthhaus.payment_transactions(practitioner_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_seeker 
ON twelthhaus.payment_transactions(seeker_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status 
ON twelthhaus.payment_transactions(transaction_status);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_charged_at 
ON twelthhaus.payment_transactions(charged_at);

-- Refunds indexes
CREATE INDEX IF NOT EXISTS idx_payment_refunds_transaction 
ON twelthhaus.payment_refunds(payment_transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_booking 
ON twelthhaus.payment_refunds(booking_id);

CREATE INDEX IF NOT EXISTS idx_payment_refunds_status 
ON twelthhaus.payment_refunds(refund_status);

-- Disputes indexes
CREATE INDEX IF NOT EXISTS idx_payment_disputes_transaction 
ON twelthhaus.payment_disputes(payment_transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_disputes_booking 
ON twelthhaus.payment_disputes(booking_id);

CREATE INDEX IF NOT EXISTS idx_payment_disputes_status 
ON twelthhaus.payment_disputes(dispute_status);

-- Webhooks indexes
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_event_type 
ON twelthhaus.stripe_webhooks(event_type);

CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_processed 
ON twelthhaus.stripe_webhooks(processed);

CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_created_at 
ON twelthhaus.stripe_webhooks(created_at);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update timestamps on record changes
CREATE OR REPLACE FUNCTION twelthhaus.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all payment tables
CREATE TRIGGER update_stripe_connect_accounts_updated_at 
    BEFORE UPDATE ON twelthhaus.stripe_connect_accounts 
    FOR EACH ROW EXECUTE FUNCTION twelthhaus.update_updated_at_column();

CREATE TRIGGER update_payment_intents_updated_at 
    BEFORE UPDATE ON twelthhaus.payment_intents 
    FOR EACH ROW EXECUTE FUNCTION twelthhaus.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON twelthhaus.payment_transactions 
    FOR EACH ROW EXECUTE FUNCTION twelthhaus.update_updated_at_column();

CREATE TRIGGER update_payment_refunds_updated_at 
    BEFORE UPDATE ON twelthhaus.payment_refunds 
    FOR EACH ROW EXECUTE FUNCTION twelthhaus.update_updated_at_column();

CREATE TRIGGER update_payment_disputes_updated_at 
    BEFORE UPDATE ON twelthhaus.payment_disputes 
    FOR EACH ROW EXECUTE FUNCTION twelthhaus.update_updated_at_column();

CREATE TRIGGER update_payout_schedules_updated_at 
    BEFORE UPDATE ON twelthhaus.payout_schedules 
    FOR EACH ROW EXECUTE FUNCTION twelthhaus.update_updated_at_column();

CREATE TRIGGER update_stripe_webhooks_updated_at 
    BEFORE UPDATE ON twelthhaus.stripe_webhooks 
    FOR EACH ROW EXECUTE FUNCTION twelthhaus.update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at 
    BEFORE UPDATE ON twelthhaus.platform_settings 
    FOR EACH ROW EXECUTE FUNCTION twelthhaus.update_updated_at_column();

-- ============================================================================
-- DEFAULT PAYMENT SETTINGS
-- ============================================================================

-- Insert default platform fee rate (5% for 12thhaus)
INSERT INTO twelthhaus.platform_settings (setting_key, setting_value, setting_type, description)
VALUES 
    ('platform_fee_percentage', '5.0', 'decimal', 'Platform fee percentage for spiritual services'),
    ('stripe_connect_application_fee_percentage', '5.0', 'decimal', 'Stripe Connect application fee percentage'),
    ('minimum_booking_amount', '2500', 'integer', 'Minimum booking amount in cents ($25.00)'),
    ('maximum_booking_amount', '50000', 'integer', 'Maximum booking amount in cents ($500.00)'),
    ('refund_window_hours', '24', 'integer', 'Hours after booking during which full refunds are allowed'),
    ('payment_hold_days', '1', 'integer', 'Days to hold payments before releasing to practitioners'),
    ('dispute_response_days', '7', 'integer', 'Days practitioners have to respond to disputes')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================

/*
CORRECTED PAYMENT SCHEMA FEATURES:

1. PROPER FOREIGN KEY TYPES:
   - practitioner_id: TEXT (matches practitioners.id)
   - seeker_id: TEXT (matches users.id)  
   - booking_id: UUID (matches spiritual_bookings.id)

2. STRIPE CONNECT INTEGRATION:
   - Express accounts for practitioners
   - Automatic platform fee collection (5%)
   - Escrow payments until session completion
   - Webhook processing for real-time updates

3. COMPREHENSIVE PAYMENT TRACKING:
   - Payment intents with client secrets
   - Transaction records with timing
   - Refund processing and tracking
   - Dispute management with evidence
   - Payout scheduling and automation

4. AUDIT TRAIL:
   - Complete transaction history
   - Webhook event logging
   - Automated timestamp updates
   - Comprehensive indexing for performance

5. SECURITY & COMPLIANCE:
   - PCI compliance via Stripe
   - Webhook signature verification
   - No sensitive card data storage
   - Complete audit logging
*/