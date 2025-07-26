-- Create service_offerings table for 12thhaus v2.0 service marketplace
CREATE TABLE IF NOT EXISTS twelthhaus.service_offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES twelthhaus.practitioners(id) ON DELETE CASCADE,
    spiritual_discipline_id INTEGER NOT NULL REFERENCES twelthhaus.spiritual_disciplines(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    pricing_model VARCHAR(20) NOT NULL DEFAULT 'fixed' CHECK (pricing_model IN ('fixed', 'sliding_scale', 'donation_based')),
    duration_minutes INTEGER NOT NULL,
    is_remote BOOLEAN NOT NULL DEFAULT true,
    is_in_person BOOLEAN NOT NULL DEFAULT false,
    location_details TEXT,
    max_participants INTEGER DEFAULT 1,
    requirements TEXT,
    preparation_instructions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_offerings_practitioner ON twelthhaus.service_offerings(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_service_offerings_discipline ON twelthhaus.service_offerings(spiritual_discipline_id);
CREATE INDEX IF NOT EXISTS idx_service_offerings_active ON twelthhaus.service_offerings(is_active);
CREATE INDEX IF NOT EXISTS idx_service_offerings_price ON twelthhaus.service_offerings(price);
CREATE INDEX IF NOT EXISTS idx_service_offerings_duration ON twelthhaus.service_offerings(duration_minutes);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION twelthhaus.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_offerings_modtime 
    BEFORE UPDATE ON twelthhaus.service_offerings 
    FOR EACH ROW EXECUTE FUNCTION twelthhaus.update_modified_column();

-- Add some sample service offerings for testing
INSERT INTO twelthhaus.service_offerings (
    practitioner_id, 
    spiritual_discipline_id, 
    title, 
    description, 
    price, 
    pricing_model, 
    duration_minutes, 
    is_remote, 
    is_in_person, 
    requirements
) VALUES 
(
    (SELECT id FROM twelthhaus.practitioners LIMIT 1),
    2,  -- Tarot Reading
    'Intuitive Tarot Reading Session',
    'A comprehensive tarot reading focused on your current life path, challenges, and opportunities. Using traditional Celtic Cross spread with intuitive guidance.',
    75.00,
    'fixed',
    60,
    true,
    true,
    'Please come with specific questions or areas of focus. An open mind and quiet space for remote sessions.'
),
(
    (SELECT id FROM twelthhaus.practitioners LIMIT 1),
    3,  -- Reiki Healing
    'Distance Reiki Healing Session',
    'A powerful remote Reiki healing session to balance your energy centers, release blockages, and promote deep relaxation and healing.',
    65.00,
    'sliding_scale',
    45,
    true,
    false,
    'Please be in a comfortable, quiet space during the scheduled time. Hydration recommended before and after.'
),
(
    (SELECT id FROM twelthhaus.practitioners LIMIT 1),
    6,  -- Chakra Balancing
    'Complete Chakra Assessment & Balancing',
    'In-depth chakra analysis with personalized healing recommendations. Includes energy clearing, balancing work, and follow-up guidance.',
    120.00,
    'fixed',
    90,
    true,
    true,
    'Comfortable clothing recommended. Please avoid heavy meals 2 hours before session.'
);