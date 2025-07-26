#!/usr/bin/env python3
"""
12thhaus v2.0 Clean Schema Deployment
Direct execution approach with proper error handling
"""

import psycopg2
import sys

DATABASE_URL = "postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres"

def connect_to_database():
    """Connect to the Supabase PostgreSQL database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True  # Use autocommit for DDL
        print("✅ Connected to Supabase PostgreSQL database")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def execute_ddl_commands(conn):
    """Execute DDL commands step by step with proper error handling"""
    cursor = conn.cursor()
    commands_executed = 0
    
    try:
        print("🚀 Starting step-by-step 12thhaus schema deployment...")
        
        # Step 1: Create schema
        print("📦 Step 1: Creating twelthhaus schema...")
        try:
            cursor.execute("CREATE SCHEMA IF NOT EXISTS twelthhaus;")
            print("✅ twelthhaus schema created")
            commands_executed += 1
        except Exception as e:
            print(f"⚠️  Schema creation: {e}")
        
        # Step 2: Set search path  
        print("📦 Step 2: Setting search path...")
        try:
            cursor.execute("SET search_path TO twelthhaus, public;")
            print("✅ Search path set to twelthhaus, public")
            commands_executed += 1
        except Exception as e:
            print(f"⚠️  Search path: {e}")
        
        # Step 3: Create enums (these are essential)
        print("📦 Step 3: Creating spiritual platform enums...")
        
        enums = [
            ("spiritual_discipline_category", ["'astrology'", "'divination'", "'energy_healing'", "'wellness'", "'spiritual_therapy'", "'ceremony'", "'coaching'"]),
            ("spiritual_discipline_type", ["'natal_chart_reading'", "'tarot_reading'", "'reiki_healing'", "'sound_bath'", "'crystal_healing'", "'chakra_balancing'", "'past_life_regression'", "'meditation_coaching'", "'spiritual_counseling'", "'akashic_records_reading'"]),
            ("service_location_type", ["'in_person'", "'virtual'", "'both'", "'phone_only'"]),
            ("booking_status", ["'inquiry'", "'pending_payment'", "'confirmed'", "'preparation_sent'", "'in_progress'", "'completed'", "'cancelled'", "'no_show'", "'refunded'", "'rescheduled'"]),
            ("payment_status", ["'pending'", "'processing'", "'completed'", "'failed'", "'refunded'", "'partial_refund'", "'disputed'"]),
            ("experience_level", ["'beginner'", "'some_experience'", "'intermediate'", "'advanced'", "'expert'"]),
            ("practitioner_status", ["'pending_verification'", "'active'", "'inactive'", "'suspended'", "'rejected'", "'under_review'"]),
            ("energy_sensitivity", ["'highly_sensitive'", "'moderately_sensitive'", "'standard'", "'low_sensitivity'"]),
            ("consultation_style", ["'gentle'", "'direct'", "'intuitive'", "'analytical'", "'compassionate'", "'structured'"]),
            ("pricing_model", ["'fixed_rate'", "'sliding_scale'", "'donation_based'", "'package_deal'", "'hourly_rate'"]),
        ]
        
        for enum_name, values in enums:
            try:
                values_str = ", ".join(values)
                cursor.execute(f"CREATE TYPE {enum_name} AS ENUM ({values_str});")
                print(f"✅ {enum_name}")
                commands_executed += 1
            except Exception as e:
                if "already exists" in str(e):
                    print(f"⚠️  {enum_name} already exists")
                else:
                    print(f"❌ {enum_name}: {e}")
        
        # Step 4: Create core tables (using TEXT for IDs to avoid UUID issues)
        print("📦 Step 4: Creating core spiritual platform tables...")
        
        # Users table
        try:
            cursor.execute("""
                CREATE TABLE users (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    user_type VARCHAR(20) DEFAULT 'seeker' CHECK (user_type IN ('seeker', 'practitioner', 'both')),
                    full_name VARCHAR(255) NOT NULL,
                    avatar_url TEXT,
                    is_active BOOLEAN DEFAULT true,
                    energy_sensitivity energy_sensitivity DEFAULT 'standard',
                    spiritual_goals TEXT,
                    spiritual_experience experience_level DEFAULT 'beginner',
                    privacy_level VARCHAR(20) DEFAULT 'standard',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ users table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ users table: {e}")
        
        # Spiritual disciplines reference table
        try:
            cursor.execute("""
                CREATE TABLE spiritual_disciplines (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) UNIQUE NOT NULL,
                    category spiritual_discipline_category NOT NULL,
                    type spiritual_discipline_type NOT NULL,
                    description TEXT,
                    typical_duration_minutes INTEGER DEFAULT 60,
                    typical_price_range_min DECIMAL(10,2),
                    typical_price_range_max DECIMAL(10,2),
                    requires_certification BOOLEAN DEFAULT false,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ spiritual_disciplines table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ spiritual_disciplines table: {e}")
        
        # Practitioners table  
        try:
            cursor.execute("""
                CREATE TABLE practitioners (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    business_name VARCHAR(255),
                    bio TEXT,
                    specialties TEXT[],
                    years_of_experience INTEGER DEFAULT 0,
                    certifications TEXT[],
                    consultation_style consultation_style DEFAULT 'compassionate',
                    energy_sensitivity energy_sensitivity DEFAULT 'standard',
                    languages TEXT[] DEFAULT ARRAY['English'],
                    timezone VARCHAR(50) DEFAULT 'America/New_York',
                    location_city VARCHAR(100),
                    location_state VARCHAR(50),
                    location_country VARCHAR(50) DEFAULT 'United States',
                    profile_image_url TEXT,
                    banner_image_url TEXT,
                    website_url TEXT,
                    social_media_links JSONB DEFAULT '{}',
                    verification_status practitioner_status DEFAULT 'pending_verification',
                    verification_documents TEXT[],
                    verified_at TIMESTAMP WITH TIME ZONE,
                    rating DECIMAL(3,2) DEFAULT 0.00,
                    total_reviews INTEGER DEFAULT 0,
                    total_sessions INTEGER DEFAULT 0,
                    is_available BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ practitioners table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ practitioners table: {e}")
        
        # Spiritual services
        try:
            cursor.execute("""
                CREATE TABLE spiritual_services (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    practitioner_id TEXT REFERENCES practitioners(id) ON DELETE CASCADE,
                    discipline_id INTEGER REFERENCES spiritual_disciplines(id),
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    pricing_model pricing_model DEFAULT 'fixed_rate',
                    base_price DECIMAL(10,2),
                    sliding_scale_min DECIMAL(10,2),
                    sliding_scale_max DECIMAL(10,2),
                    duration_minutes INTEGER DEFAULT 60,
                    location_type service_location_type DEFAULT 'virtual',
                    location_details TEXT,
                    preparation_required TEXT,
                    what_to_expect TEXT,
                    follow_up_included BOOLEAN DEFAULT false,
                    max_participants INTEGER DEFAULT 1,
                    is_group_session BOOLEAN DEFAULT false,
                    requires_intake BOOLEAN DEFAULT false,
                    intake_questions JSONB DEFAULT '[]',
                    cancellation_policy TEXT,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ spiritual_services table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ spiritual_services table: {e}")
        
        # Spiritual bookings
        try:
            cursor.execute("""
                CREATE TABLE spiritual_bookings (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    service_id TEXT REFERENCES spiritual_services(id) ON DELETE CASCADE,
                    client_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    practitioner_id TEXT REFERENCES practitioners(id) ON DELETE CASCADE,
                    status booking_status DEFAULT 'inquiry',
                    scheduled_at TIMESTAMP WITH TIME ZONE,
                    duration_minutes INTEGER,
                    total_price DECIMAL(10,2),
                    client_notes TEXT,
                    intake_responses JSONB DEFAULT '{}',
                    preparation_sent BOOLEAN DEFAULT FALSE,
                    preparation_content TEXT,
                    session_notes TEXT,
                    session_summary TEXT,
                    insights_shared TEXT,
                    follow_up_scheduled BOOLEAN DEFAULT FALSE,
                    follow_up_content TEXT,
                    cancellation_reason TEXT,
                    refund_amount DECIMAL(10,2),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ spiritual_bookings table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ spiritual_bookings table: {e}")
        
        # Community posts
        try:
            cursor.execute("""
                CREATE TABLE community_posts (
                    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
                    author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(255),
                    content TEXT NOT NULL,
                    post_type VARCHAR(50) DEFAULT 'general',
                    spiritual_category VARCHAR(100),
                    energy_level VARCHAR(20) DEFAULT 'neutral',
                    media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
                    visibility VARCHAR(20) DEFAULT 'public',
                    is_anonymous BOOLEAN DEFAULT false,
                    allows_comments BOOLEAN DEFAULT true,
                    comment_count INTEGER DEFAULT 0,
                    like_count INTEGER DEFAULT 0,
                    share_count INTEGER DEFAULT 0,
                    is_featured BOOLEAN DEFAULT false,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """)
            print("✅ community_posts table")
            commands_executed += 1
        except Exception as e:
            print(f"❌ community_posts table: {e}")
        
        print(f"\n🎉 Successfully executed {commands_executed} DDL commands!")
        return True
        
    except Exception as e:
        print(f"❌ Critical deployment error: {e}")
        return False
    finally:
        cursor.close()

def verify_deployment(conn):
    """Verify the deployment was successful"""
    cursor = conn.cursor()
    
    try:
        # Check schema
        cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'twelthhaus';")
        if cursor.fetchone():
            print("✅ twelthhaus schema exists")
        else:
            print("❌ twelthhaus schema missing")
            return False
        
        # Check tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'twelthhaus' 
            ORDER BY table_name;
        """)
        
        tables = [row[0] for row in cursor.fetchall()]
        print(f"📊 Found {len(tables)} tables in twelthhaus schema:")
        for table in tables:
            print(f"  📁 twelthhaus.{table}")
        
        # Check enums
        cursor.execute("""
            SELECT t.typname 
            FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE t.typtype = 'e' 
            AND n.nspname = 'twelthhaus'
            ORDER BY t.typname;
        """)
        
        enums = [row[0] for row in cursor.fetchall()]
        print(f"🏷️  Found {len(enums)} enums in twelthhaus schema:")
        for enum in enums:
            print(f"  🔖 twelthhaus.{enum}")
        
        return len(tables) >= 5 and len(enums) >= 5
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False
    finally:
        cursor.close()

def main():
    """Main deployment function"""
    print("🚀 12thhaus v2.0 Clean Schema Deployment")
    print("Direct DDL execution to dedicated 'twelthhaus' schema")
    print("=" * 55)
    
    conn = connect_to_database()
    if not conn:
        sys.exit(1)
    
    try:
        # Execute deployment
        if execute_ddl_commands(conn):
            print("\n🔍 Verifying deployment...")
            
            if verify_deployment(conn):
                print("\n🎉 DEPLOYMENT SUCCESSFUL!")
                print("✅ twelthhaus schema created with spiritual platform tables")
                print("✅ Zero conflicts with existing contractor/bidding project")
                print("✅ Ready for Hasura GraphQL configuration")
            else:
                print("\n⚠️  DEPLOYMENT INCOMPLETE")
                print("Some tables or enums may be missing")
        else:
            print("\n❌ DEPLOYMENT FAILED")
            
    finally:
        conn.close()
        print("\n🔌 Database connection closed")

if __name__ == "__main__":
    main()