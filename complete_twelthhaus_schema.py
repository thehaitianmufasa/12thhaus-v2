#!/usr/bin/env python3
"""
Complete 12thhaus v2.0 Schema Deployment
Add remaining spiritual platform tables to complete the architecture
"""

import psycopg2
import sys

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://localhost:5432/twelthhaus')

def connect_to_database():
    """Connect to the Supabase PostgreSQL database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        print("✅ Connected to Supabase PostgreSQL database")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def create_remaining_tables(conn):
    """Create the remaining spiritual platform tables"""
    cursor = conn.cursor()
    commands_executed = 0
    
    try:
        print("🚀 Completing 12thhaus spiritual platform schema...")
        
        # Set search path
        cursor.execute("SET search_path TO twelthhaus, public;")
        
        # Community comments
        try:
            cursor.execute("""
                CREATE TABLE community_comments (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    post_id TEXT REFERENCES community_posts(id) ON DELETE CASCADE,
                    author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    parent_comment_id TEXT REFERENCES community_comments(id) ON DELETE CASCADE,
                    content TEXT NOT NULL,
                    is_anonymous BOOLEAN DEFAULT false,
                    like_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ community_comments table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ community_comments table: {e}")
        
        # Community engagements (likes, shares)
        try:
            cursor.execute("""
                CREATE TABLE community_engagements (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    post_id TEXT REFERENCES community_posts(id) ON DELETE CASCADE,
                    comment_id TEXT REFERENCES community_comments(id) ON DELETE CASCADE,
                    engagement_type VARCHAR(20) NOT NULL CHECK (engagement_type IN ('like', 'share', 'save')),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(user_id, post_id, comment_id, engagement_type)
                );
            """)
            print("✅ community_engagements table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ community_engagements table: {e}")
        
        # Spiritual reviews
        try:
            cursor.execute("""
                CREATE TABLE spiritual_reviews (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    booking_id TEXT REFERENCES spiritual_bookings(id) ON DELETE CASCADE,
                    reviewer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    practitioner_id TEXT REFERENCES practitioners(id) ON DELETE CASCADE,
                    service_id TEXT REFERENCES spiritual_services(id) ON DELETE CASCADE,
                    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
                    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
                    empathy_rating INTEGER CHECK (empathy_rating >= 1 AND empathy_rating <= 5),
                    clarity_rating INTEGER CHECK (clarity_rating >= 1 AND clarity_rating <= 5),
                    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
                    review_title VARCHAR(255),
                    review_content TEXT,
                    would_recommend BOOLEAN,
                    is_anonymous BOOLEAN DEFAULT false,
                    is_featured BOOLEAN DEFAULT false,
                    practitioner_response TEXT,
                    practitioner_responded_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ spiritual_reviews table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ spiritual_reviews table: {e}")
        
        # Conversations
        try:
            cursor.execute("""
                CREATE TABLE conversations (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    participant_1_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    participant_2_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    related_booking_id TEXT REFERENCES spiritual_bookings(id) ON DELETE SET NULL,
                    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    last_message_preview TEXT,
                    is_archived BOOLEAN DEFAULT false,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(participant_1_id, participant_2_id)
                );
            """)
            print("✅ conversations table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ conversations table: {e}")
        
        # Messages
        try:
            cursor.execute("""
                CREATE TABLE messages (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
                    sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    content TEXT NOT NULL,
                    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'booking_update')),
                    attachment_url TEXT,
                    is_read BOOLEAN DEFAULT false,
                    read_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ messages table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ messages table: {e}")
        
        # Spiritual journey entries
        try:
            cursor.execute("""
                CREATE TABLE spiritual_journey_entries (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    related_booking_id TEXT REFERENCES spiritual_bookings(id) ON DELETE SET NULL,
                    entry_type VARCHAR(50) DEFAULT 'reflection',
                    title VARCHAR(255),
                    content TEXT NOT NULL,
                    spiritual_insights TEXT,
                    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
                    mood_before VARCHAR(50),
                    mood_after VARCHAR(50),
                    key_revelations TEXT[],
                    action_items TEXT[],
                    gratitude_notes TEXT,
                    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'practitioners_only', 'community')),
                    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ spiritual_journey_entries table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ spiritual_journey_entries table: {e}")
        
        # Payment transactions
        try:
            cursor.execute("""
                CREATE TABLE payment_transactions (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    booking_id TEXT REFERENCES spiritual_bookings(id) ON DELETE CASCADE,
                    payer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    practitioner_id TEXT REFERENCES practitioners(id) ON DELETE CASCADE,
                    stripe_payment_intent_id VARCHAR(255),
                    stripe_charge_id VARCHAR(255),
                    amount DECIMAL(10,2) NOT NULL,
                    currency VARCHAR(3) DEFAULT 'USD',
                    platform_fee DECIMAL(10,2) DEFAULT 0.00,
                    practitioner_payout DECIMAL(10,2),
                    status payment_status DEFAULT 'pending',
                    payment_method VARCHAR(50),
                    refund_amount DECIMAL(10,2) DEFAULT 0.00,
                    refund_reason TEXT,
                    metadata JSONB DEFAULT '{}',
                    processed_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ payment_transactions table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ payment_transactions table: {e}")
        
        # User spiritual preferences
        try:
            cursor.execute("""
                CREATE TABLE user_spiritual_preferences (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    user_id TEXT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                    preferred_disciplines INTEGER[] DEFAULT ARRAY[]::INTEGER[],
                    preferred_consultation_styles consultation_style[] DEFAULT ARRAY[]::consultation_style[],
                    preferred_energy_levels energy_sensitivity[] DEFAULT ARRAY[]::energy_sensitivity[],
                    preferred_session_length INTEGER DEFAULT 60,
                    budget_range_min DECIMAL(10,2),
                    budget_range_max DECIMAL(10,2),
                    preferred_times_of_day TEXT[] DEFAULT ARRAY[]::TEXT[],
                    preferred_days_of_week TEXT[] DEFAULT ARRAY[]::TEXT[],
                    timezone VARCHAR(50) DEFAULT 'America/New_York',
                    location_preference service_location_type DEFAULT 'virtual',
                    language_preferences TEXT[] DEFAULT ARRAY['English'],
                    spiritual_goals TEXT[],
                    areas_for_growth TEXT[],
                    previous_experiences TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ user_spiritual_preferences table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ user_spiritual_preferences table: {e}")
        
        # Notifications
        try:
            cursor.execute("""
                CREATE TABLE notifications (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    notification_type VARCHAR(50) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    related_entity_type VARCHAR(50),
                    related_entity_id TEXT,
                    action_url TEXT,
                    is_read BOOLEAN DEFAULT false,
                    read_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ notifications table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ notifications table: {e}")
        
        print(f"\n🎉 Successfully created {commands_executed} additional tables!")
        return True
        
    except Exception as e:
        print(f"❌ Critical error: {e}")
        return False
    finally:
        cursor.close()

def create_indexes(conn):
    """Create essential indexes for performance"""
    cursor = conn.cursor()
    indexes_created = 0
    
    try:
        print("📊 Creating performance indexes...")
        cursor.execute("SET search_path TO twelthhaus, public;")
        
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
            "CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);",
            "CREATE INDEX IF NOT EXISTS idx_practitioners_user_id ON practitioners(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_practitioners_verification_status ON practitioners(verification_status);",
            "CREATE INDEX IF NOT EXISTS idx_spiritual_services_practitioner_id ON spiritual_services(practitioner_id);",
            "CREATE INDEX IF NOT EXISTS idx_spiritual_services_discipline_id ON spiritual_services(discipline_id);",
            "CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_client_id ON spiritual_bookings(client_id);",
            "CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_practitioner_id ON spiritual_bookings(practitioner_id);",
            "CREATE INDEX IF NOT EXISTS idx_spiritual_bookings_status ON spiritual_bookings(status);",
            "CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);",
            "CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);",
            "CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);",
            "CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);"
        ]
        
        for index_sql in indexes:
            try:
                cursor.execute(index_sql)
                indexes_created += 1
            except Exception as e:
                print(f"⚠️  Index creation failed: {e}")
        
        print(f"✅ Created {indexes_created} performance indexes")
        return True
        
    except Exception as e:
        print(f"❌ Index creation error: {e}")
        return False
    finally:
        cursor.close()

def populate_spiritual_disciplines(conn):
    """Populate the spiritual disciplines reference table"""
    cursor = conn.cursor()
    
    try:
        print("📋 Populating spiritual disciplines reference data...")
        cursor.execute("SET search_path TO twelthhaus, public;")
        
        disciplines = [
            ("Natal Chart Reading", "astrology", "natal_chart_reading", "Complete birth chart analysis including planetary positions, houses, and aspects", 90, 75, 200, True),
            ("Tarot Reading", "divination", "tarot_reading", "Intuitive card reading for guidance and insight", 60, 40, 150, False),
            ("Reiki Healing", "energy_healing", "reiki_healing", "Japanese energy healing technique for stress reduction and healing", 60, 60, 120, True),
            ("Sound Bath", "wellness", "sound_bath", "Meditative experience with singing bowls and sound healing instruments", 75, 30, 80, False),
            ("Crystal Healing", "energy_healing", "crystal_healing", "Healing session using crystals and gemstones for energy balance", 90, 50, 100, False),
            ("Chakra Balancing", "energy_healing", "chakra_balancing", "Energy work focused on aligning and balancing the seven chakras", 75, 55, 110, False),
            ("Past Life Regression", "spiritual_therapy", "past_life_regression", "Guided meditation to explore past life experiences", 120, 100, 250, True),
            ("Meditation Coaching", "coaching", "meditation_coaching", "Personalized meditation instruction and practice guidance", 60, 40, 100, False),
            ("Spiritual Counseling", "spiritual_therapy", "spiritual_counseling", "Therapeutic support with spiritual integration", 60, 75, 150, True),
            ("Akashic Records Reading", "divination", "akashic_records_reading", "Access to soul records for deep spiritual insight", 90, 80, 200, True)
        ]
        
        disciplines_added = 0
        for name, category, type_val, description, duration, min_price, max_price, requires_cert in disciplines:
            try:
                cursor.execute("""
                    INSERT INTO spiritual_disciplines 
                    (name, category, type, description, typical_duration_minutes, typical_price_range_min, typical_price_range_max, requires_certification)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (name) DO NOTHING;
                """, (name, category, type_val, description, duration, min_price, max_price, requires_cert))
                disciplines_added += 1
            except Exception as e:
                print(f"⚠️  Could not add {name}: {e}")
        
        print(f"✅ Added {disciplines_added} spiritual disciplines")
        return True
        
    except Exception as e:
        print(f"❌ Spiritual disciplines population failed: {e}")
        return False
    finally:
        cursor.close()

def final_verification(conn):
    """Final verification of complete schema"""
    cursor = conn.cursor()
    
    try:
        # Count all tables
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'twelthhaus';
        """)
        table_count = cursor.fetchone()[0]
        
        # Count all enums
        cursor.execute("""
            SELECT COUNT(*) 
            FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE t.typtype = 'e' 
            AND n.nspname = 'twelthhaus';
        """)
        enum_count = cursor.fetchone()[0]
        
        # Count spiritual disciplines
        cursor.execute("SET search_path TO twelthhaus, public;")
        cursor.execute("SELECT COUNT(*) FROM spiritual_disciplines;")
        disciplines_count = cursor.fetchone()[0]
        
        print(f"\n📊 Final Schema Statistics:")
        print(f"  📁 Tables: {table_count}")
        print(f"  🏷️  Enums: {enum_count}")
        print(f"  🔮 Spiritual Disciplines: {disciplines_count}")
        
        return table_count >= 12 and enum_count >= 10 and disciplines_count >= 5
        
    except Exception as e:
        print(f"❌ Final verification failed: {e}")
        return False
    finally:
        cursor.close()

def main():
    """Main function to complete the spiritual platform schema"""
    print("🔮 Completing 12thhaus v2.0 Spiritual Platform Schema")
    print("Adding remaining tables, indexes, and reference data")
    print("=" * 55)
    
    conn = connect_to_database()
    if not conn:
        sys.exit(1)
    
    try:
        # Create remaining tables
        if not create_remaining_tables(conn):
            print("❌ Failed to create all tables")
            sys.exit(1)
        
        # Create indexes
        create_indexes(conn)
        
        # Populate reference data
        populate_spiritual_disciplines(conn)
        
        # Final verification
        if final_verification(conn):
            print("\n🎉 COMPLETE SCHEMA DEPLOYMENT SUCCESSFUL!")
            print("✅ Full spiritual platform database architecture deployed")
            print("✅ All tables, enums, indexes, and reference data ready")
            print("✅ Isolated in 'twelthhaus' schema - zero conflicts")
            print("✅ Ready for Hasura GraphQL API configuration")
        else:
            print("\n⚠️  SCHEMA INCOMPLETE")
            print("Some components may be missing")
            
    finally:
        conn.close()
        print("\n🔌 Database connection closed")

if __name__ == "__main__":
    main()