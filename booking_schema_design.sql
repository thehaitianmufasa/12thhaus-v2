-- 🗓️ BOOKING & SCHEDULING SYSTEM SCHEMA DESIGN
-- 12thhaus v2.0 - PRP 3.3: Comprehensive Spiritual Session Booking

-- ====================
-- PRACTITIONER AVAILABILITY MANAGEMENT
-- ====================

-- 1. Practitioner recurring availability patterns
CREATE TABLE IF NOT EXISTS twelthhaus.practitioner_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES twelthhaus.practitioners(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(practitioner_id, day_of_week, start_time)
);

-- 2. Specific time slots for booking
CREATE TABLE IF NOT EXISTS twelthhaus.practitioner_time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES twelthhaus.practitioners(id) ON DELETE CASCADE,
    service_offering_id UUID REFERENCES twelthhaus.service_offerings(id) ON DELETE SET NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
    is_available BOOLEAN NOT NULL DEFAULT true,
    max_bookings INTEGER NOT NULL DEFAULT 1, -- For group sessions
    current_bookings INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(practitioner_id, slot_date, start_time)
);

-- 3. Special dates and overrides (holidays, breaks, special availability)
CREATE TABLE IF NOT EXISTS twelthhaus.practitioner_schedule_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES twelthhaus.practitioners(id) ON DELETE CASCADE,
    override_date DATE NOT NULL,
    override_type VARCHAR(20) NOT NULL CHECK (override_type IN ('unavailable', 'special_hours', 'holiday')),
    start_time TIME,
    end_time TIME,
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(practitioner_id, override_date)
);

-- ====================
-- SESSION BOOKING MANAGEMENT
-- ====================

-- 4. Main bookings table
CREATE TABLE IF NOT EXISTS twelthhaus.spiritual_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seeker_id UUID NOT NULL REFERENCES twelthhaus.users(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES twelthhaus.practitioners(id) ON DELETE CASCADE,
    service_offering_id UUID NOT NULL REFERENCES twelthhaus.service_offerings(id) ON DELETE RESTRICT,
    time_slot_id UUID REFERENCES twelthhaus.practitioner_time_slots(id) ON DELETE SET NULL,
    
    -- Session details
    session_date DATE NOT NULL,
    session_start_time TIME NOT NULL,
    session_end_time TIME NOT NULL,
    session_timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
    
    -- Booking status and lifecycle
    booking_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
    ),
    
    -- Session format and details
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('remote', 'in_person', 'hybrid')),
    meeting_location TEXT, -- For in-person or hybrid
    meeting_link TEXT, -- For remote sessions (Zoom, etc.)
    meeting_password TEXT,
    
    -- Pricing and payment
    agreed_price DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'paid', 'refunded', 'failed')
    ),
    
    -- Session preparation and follow-up
    seeker_preparation_notes TEXT,
    practitioner_session_notes TEXT,
    session_recording_url TEXT,
    session_summary TEXT,
    
    -- Timestamps
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- SESSION PREPARATION & FOLLOW-UP
-- ====================

-- 5. Session preparation tracking
CREATE TABLE IF NOT EXISTS twelthhaus.session_preparations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES twelthhaus.spiritual_bookings(id) ON DELETE CASCADE,
    preparation_type VARCHAR(30) NOT NULL CHECK (
        preparation_type IN ('seeker_intake', 'practitioner_setup', 'materials_prepared', 'space_prepared')
    ),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Session follow-up and integration support
CREATE TABLE IF NOT EXISTS twelthhaus.session_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES twelthhaus.spiritual_bookings(id) ON DELETE CASCADE,
    followup_type VARCHAR(30) NOT NULL CHECK (
        followup_type IN ('practitioner_notes', 'integration_resources', 'next_steps', 'check_in')
    ),
    followup_content TEXT NOT NULL,
    is_shared_with_seeker BOOLEAN NOT NULL DEFAULT false,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- REVIEWS & FEEDBACK
-- ====================

-- 7. Session reviews and ratings
CREATE TABLE IF NOT EXISTS twelthhaus.spiritual_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES twelthhaus.spiritual_bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES twelthhaus.users(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES twelthhaus.practitioners(id) ON DELETE CASCADE,
    
    -- Multi-dimensional ratings for spiritual services
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
    clarity_rating INTEGER CHECK (clarity_rating BETWEEN 1 AND 5),
    connection_rating INTEGER CHECK (connection_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    
    -- Written feedback
    review_title VARCHAR(200),
    review_content TEXT,
    
    -- Review settings
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    
    -- Response from practitioner
    practitioner_response TEXT,
    practitioner_responded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(booking_id, reviewer_id)
);

-- ====================
-- PERFORMANCE INDEXES
-- ====================

-- Booking queries optimization
CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_seeker ON twelthhaus.spiritual_bookings(seeker_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_practitioner ON twelthhaus.spiritual_bookings(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_service ON twelthhaus.spiritual_bookings(service_offering_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_date ON twelthhaus.spiritual_bookings(session_date);
CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_status ON twelthhaus.spiritual_bookings(booking_status);

-- Availability queries optimization
CREATE INDEX IF NOT EXISTS idx_practitioner_availability_practitioner ON twelthhaus.practitioner_availability(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_availability_day ON twelthhaus.practitioner_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_time_slots_practitioner_date ON twelthhaus.practitioner_time_slots(practitioner_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON twelthhaus.practitioner_time_slots(is_available);

-- Review queries optimization
CREATE INDEX IF NOT EXISTS idx_spiritual_reviews_practitioner ON twelthhaus.spiritual_reviews(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_spiritual_reviews_public ON twelthhaus.spiritual_reviews(is_public);
CREATE INDEX IF NOT EXISTS idx_spiritual_reviews_rating ON twelthhaus.spiritual_reviews(overall_rating);

-- ====================
-- AUTOMATED TRIGGERS
-- ====================

-- Update time slot booking count when booking is created/cancelled
CREATE OR REPLACE FUNCTION twelthhaus.update_time_slot_bookings()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.time_slot_id IS NOT NULL THEN
        UPDATE twelthhaus.practitioner_time_slots 
        SET current_bookings = current_bookings + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.time_slot_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.booking_status != 'cancelled' AND NEW.booking_status = 'cancelled' AND NEW.time_slot_id IS NOT NULL THEN
        UPDATE twelthhaus.practitioner_time_slots 
        SET current_bookings = current_bookings - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.time_slot_id;
    ELSIF TG_OP = 'DELETE' AND OLD.time_slot_id IS NOT NULL THEN
        UPDATE twelthhaus.practitioner_time_slots 
        SET current_bookings = current_bookings - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.time_slot_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_time_slot_bookings
    AFTER INSERT OR UPDATE OR DELETE ON twelthhaus.spiritual_bookings
    FOR EACH ROW EXECUTE FUNCTION twelthhaus.update_time_slot_bookings();

-- Auto-update practitioner ratings based on reviews
CREATE OR REPLACE FUNCTION twelthhaus.update_practitioner_ratings()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE twelthhaus.practitioners 
    SET rating = (
        SELECT AVG(overall_rating) 
        FROM twelthhaus.spiritual_reviews 
        WHERE practitioner_id = COALESCE(NEW.practitioner_id, OLD.practitioner_id)
        AND is_public = true
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM twelthhaus.spiritual_reviews 
        WHERE practitioner_id = COALESCE(NEW.practitioner_id, OLD.practitioner_id)
        AND is_public = true
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.practitioner_id, OLD.practitioner_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_practitioner_ratings
    AFTER INSERT OR UPDATE OR DELETE ON twelthhaus.spiritual_reviews
    FOR EACH ROW EXECUTE FUNCTION twelthhaus.update_practitioner_ratings();