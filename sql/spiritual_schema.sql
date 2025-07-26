-- =====================================================
-- 12thhaus Spiritual Community Database Schema
-- PostgreSQL Schema for Spiritual Platform
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS for Spiritual Platform
-- =====================================================

CREATE TYPE spiritual_service_category AS ENUM (
    'tarot',
    'astrology', 
    'reiki',
    'life_coaching',
    'meditation',
    'energy_healing',
    'crystal_healing',
    'numerology',
    'chakra_balancing',
    'spiritual_counseling'
);

CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed', 
    'completed',
    'cancelled',
    'refunded'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded'
);

CREATE TYPE experience_level AS ENUM (
    'beginner',
    'intermediate', 
    'advanced',
    'expert'
);

CREATE TYPE user_type AS ENUM (
    'seeker',
    'practitioner',
    'both'
);

-- =====================================================
-- CORE USER TABLES
-- =====================================================

-- Base users table (shared across all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    user_type user_type DEFAULT 'seeker',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practitioners table (spiritual service providers)
CREATE TABLE practitioners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    specialties spiritual_service_category[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    certifications JSONB DEFAULT '[]'::jsonb,
    availability_schedule JSONB DEFAULT '{}'::jsonb,
    hourly_rate DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_account_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB DEFAULT '[]'::jsonb,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    is_accepting_clients BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Seekers table (spiritual service seekers)
CREATE TABLE seekers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    spiritual_interests spiritual_service_category[] DEFAULT '{}',
    experience_level experience_level DEFAULT 'beginner',
    goals TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    birth_date DATE,
    birth_time TIME,
    birth_location VARCHAR(255),
    profile_image_url TEXT,
    is_public_profile BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- SPIRITUAL SERVICES & BOOKING SYSTEM
-- =====================================================

-- Spiritual services offered by practitioners
CREATE TABLE spiritual_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practitioner_id UUID REFERENCES practitioners(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category spiritual_service_category NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    preparation_instructions TEXT,
    what_to_expect TEXT,
    requirements TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    max_advance_booking_days INTEGER DEFAULT 90,
    min_advance_booking_hours INTEGER DEFAULT 24,
    cancellation_policy TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking system for spiritual sessions
CREATE TABLE spiritual_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practitioner_id UUID REFERENCES practitioners(id) ON DELETE CASCADE,
    seeker_id UUID REFERENCES seekers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES spiritual_services(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    platform_fee DECIMAL(10,2) DEFAULT 0.00,
    practitioner_earnings DECIMAL(10,2),
    status booking_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_intent_id VARCHAR(255),
    meeting_link TEXT,
    meeting_password VARCHAR(50),
    seeker_notes TEXT,
    practitioner_notes TEXT,
    session_recording_url TEXT,
    session_summary TEXT,
    completion_notes TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews and ratings for completed sessions
CREATE TABLE spiritual_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practitioner_id UUID REFERENCES practitioners(id) ON DELETE CASCADE,
    seeker_id UUID REFERENCES seekers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES spiritual_bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    practitioner_response TEXT,
    practitioner_response_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(booking_id)
);

-- =====================================================
-- COMMUNITY & CONTENT SYSTEM
-- =====================================================

-- Community posts for spiritual discussions
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category spiritual_service_category,
    tags TEXT[] DEFAULT '{}',
    image_urls TEXT[] DEFAULT '{}',
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments on community posts
CREATE TABLE community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes for posts and comments
CREATE TABLE community_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id),
    CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- =====================================================
-- MESSAGING SYSTEM
-- =====================================================

-- Direct messages between users
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES spiritual_bookings(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SPIRITUAL AI ENHANCEMENT TABLES
-- =====================================================

-- AI-powered spiritual matching preferences
CREATE TABLE spiritual_matching_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preferred_practitioner_types spiritual_service_category[] DEFAULT '{}',
    preferred_experience_levels experience_level[] DEFAULT '{}',
    preferred_price_range_min DECIMAL(10,2),
    preferred_price_range_max DECIMAL(10,2),
    preferred_session_durations INTEGER[] DEFAULT '{}',
    preferred_times_of_day VARCHAR(50)[] DEFAULT '{}',
    preferred_days_of_week INTEGER[] DEFAULT '{}',
    personality_traits JSONB DEFAULT '{}'::jsonb,
    spiritual_goals JSONB DEFAULT '{}'::jsonb,
    communication_style VARCHAR(50),
    energy_sensitivity_level INTEGER DEFAULT 5,
    previous_experience_feedback JSONB DEFAULT '[]'::jsonb,
    ai_matching_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Spiritual journey tracking for seekers
CREATE TABLE spiritual_journey_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seeker_id UUID REFERENCES seekers(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    practitioner_id UUID REFERENCES practitioners(id) ON DELETE SET NULL,
    service_category spiritual_service_category NOT NULL,
    pre_session_mood_rating INTEGER CHECK (pre_session_mood_rating >= 1 AND pre_session_mood_rating <= 10),
    post_session_mood_rating INTEGER CHECK (post_session_mood_rating >= 1 AND post_session_mood_rating <= 10),
    insights_gained TEXT,
    goals_progress JSONB DEFAULT '{}'::jsonb,
    challenges_faced TEXT,
    recommendations_received TEXT,
    personal_reflections TEXT,
    ai_insights JSONB DEFAULT '{}'::jsonb,
    milestone_achieved BOOLEAN DEFAULT FALSE,
    milestone_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI-curated spiritual content recommendations
CREATE TABLE spiritual_content_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- article, video, meditation, course
    content_title VARCHAR(255) NOT NULL,
    content_description TEXT,
    content_url TEXT,
    content_category spiritual_service_category,
    recommendation_reason TEXT,
    ai_confidence_score DECIMAL(3,2),
    user_interest_score DECIMAL(3,2),
    is_viewed BOOLEAN DEFAULT FALSE,
    is_liked BOOLEAN DEFAULT FALSE,
    viewing_duration_seconds INTEGER,
    user_feedback_rating INTEGER CHECK (user_feedback_rating >= 1 AND user_feedback_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX(user_id, created_at),
    INDEX(user_id, is_viewed),
    INDEX(content_category)
);

-- =====================================================
-- PAYMENT & FINANCIAL TRACKING
-- =====================================================

-- Payment transactions for spiritual services
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES spiritual_bookings(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_transfer_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    platform_fee DECIMAL(10,2) NOT NULL,
    practitioner_earnings DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    status payment_status DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practitioner earnings and payouts
CREATE TABLE practitioner_earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practitioner_id UUID REFERENCES practitioners(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    gross_earnings DECIMAL(10,2) DEFAULT 0.00,
    platform_fees DECIMAL(10,2) DEFAULT 0.00,
    net_earnings DECIMAL(10,2) DEFAULT 0.00,
    payout_amount DECIMAL(10,2) DEFAULT 0.00,
    payout_date DATE,
    stripe_payout_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(practitioner_id, period_start, period_end)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Practitioner indexes
CREATE INDEX idx_practitioners_user_id ON practitioners(user_id);
CREATE INDEX idx_practitioners_specialties ON practitioners USING GIN(specialties);
CREATE INDEX idx_practitioners_is_verified ON practitioners(is_verified);
CREATE INDEX idx_practitioners_rating ON practitioners(rating_average DESC);
CREATE INDEX idx_practitioners_featured ON practitioners(featured, rating_average DESC);

-- Seeker indexes
CREATE INDEX idx_seekers_user_id ON seekers(user_id);
CREATE INDEX idx_seekers_interests ON seekers USING GIN(spiritual_interests);

-- Service indexes
CREATE INDEX idx_services_practitioner_id ON spiritual_services(practitioner_id);
CREATE INDEX idx_services_category ON spiritual_services(category);
CREATE INDEX idx_services_active ON spiritual_services(is_active);
CREATE INDEX idx_services_price ON spiritual_services(price);

-- Booking indexes
CREATE INDEX idx_bookings_practitioner_id ON spiritual_bookings(practitioner_id);
CREATE INDEX idx_bookings_seeker_id ON spiritual_bookings(seeker_id);
CREATE INDEX idx_bookings_scheduled_at ON spiritual_bookings(scheduled_at);
CREATE INDEX idx_bookings_status ON spiritual_bookings(status);
CREATE INDEX idx_bookings_payment_status ON spiritual_bookings(payment_status);

-- Review indexes
CREATE INDEX idx_reviews_practitioner_id ON spiritual_reviews(practitioner_id);
CREATE INDEX idx_reviews_rating ON spiritual_reviews(rating);
CREATE INDEX idx_reviews_created_at ON spiritual_reviews(created_at DESC);

-- Community indexes
CREATE INDEX idx_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_posts_category ON community_posts(category);
CREATE INDEX idx_posts_published ON community_posts(is_published, published_at DESC);
CREATE INDEX idx_comments_post_id ON community_comments(post_id);
CREATE INDEX idx_comments_user_id ON community_comments(user_id);

-- Message indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(recipient_id, is_read, created_at DESC);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practitioners_updated_at BEFORE UPDATE ON practitioners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seekers_updated_at BEFORE UPDATE ON seekers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON spiritual_services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON spiritual_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON spiritual_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON community_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON community_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update practitioner rating when review is added/updated
CREATE OR REPLACE FUNCTION update_practitioner_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE practitioners 
    SET 
        rating_average = (
            SELECT ROUND(AVG(rating)::numeric, 2) 
            FROM spiritual_reviews 
            WHERE practitioner_id = NEW.practitioner_id
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM spiritual_reviews 
            WHERE practitioner_id = NEW.practitioner_id
        )
    WHERE id = NEW.practitioner_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_practitioner_rating_trigger 
    AFTER INSERT OR UPDATE ON spiritual_reviews
    FOR EACH ROW EXECUTE FUNCTION update_practitioner_rating();

-- Function to update community post counters
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'community_comments' THEN
        UPDATE community_posts 
        SET comment_count = (
            SELECT COUNT(*) 
            FROM community_comments 
            WHERE post_id = NEW.post_id AND is_deleted = FALSE
        )
        WHERE id = NEW.post_id;
    END IF;
    
    IF TG_TABLE_NAME = 'community_likes' AND NEW.post_id IS NOT NULL THEN
        UPDATE community_posts 
        SET like_count = (
            SELECT COUNT(*) 
            FROM community_likes 
            WHERE post_id = NEW.post_id
        )
        WHERE id = NEW.post_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_post_comment_count 
    AFTER INSERT OR UPDATE ON community_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER update_post_like_count 
    AFTER INSERT OR DELETE ON community_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE seekers ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_matching_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_journey_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_content_recommendations ENABLE ROW LEVEL SECURITY;

-- Sample RLS policies (to be expanded based on specific requirements)

-- Users can view their own profile and public practitioner profiles
CREATE POLICY users_select_policy ON users FOR SELECT
    USING (
        auth.uid()::text = id::text OR 
        (user_type = 'practitioner' AND is_active = true)
    );

-- Users can update their own profile
CREATE POLICY users_update_policy ON users FOR UPDATE
    USING (auth.uid()::text = id::text);

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert some sample spiritual service categories data would go here
-- This would be handled by the application migration system

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- This completes the 12thhaus Spiritual Community database schema
-- The schema supports:
-- - Dual user types (practitioners/seekers)
-- - Spiritual service marketplace
-- - Booking and payment system
-- - Community features
-- - AI-enhanced spiritual matching
-- - Journey tracking and content recommendations
-- =====================================================