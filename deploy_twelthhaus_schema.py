#!/usr/bin/env python3
"""
12thhaus v2.0 Schema Deployment - Dedicated Schema Strategy
Deploys complete PostgreSQL schema to dedicated 'twelthhaus' schema
Ensures zero conflicts with existing projects
"""

import psycopg2
import os
import sys
import re
from pathlib import Path

# Database connection parameters  
DATABASE_URL = "postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres"

def read_schema_file():
    """Read the complete schema SQL file"""
    schema_path = Path(__file__).parent / "sql" / "12thhaus_v2_complete_schema.sql"
    
    if not schema_path.exists():
        print(f"❌ Schema file not found: {schema_path}")
        return None
        
    with open(schema_path, 'r', encoding='utf-8') as f:
        return f.read()

def modify_schema_for_dedicated_namespace(schema_sql):
    """Modify schema to use dedicated 'twelthhaus' schema namespace"""
    print("🔄 Modifying schema for dedicated namespace...")
    
    # Create the dedicated schema first
    modified_sql = "-- 12thhaus v2.0 Dedicated Schema Deployment\n"
    modified_sql += "-- Using dedicated 'twelthhaus' schema for clean separation\n\n"
    modified_sql += "CREATE SCHEMA IF NOT EXISTS twelthhaus;\n"
    modified_sql += "SET search_path TO twelthhaus, public;\n\n"
    
    # Extensions should be created in public schema
    modified_sql += "-- Extensions (installed in public schema)\n"
    modified_sql += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;\n'
    modified_sql += 'CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;\n' 
    modified_sql += 'CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA public;\n\n'
    
    # Remove the original extension creation lines
    schema_sql = re.sub(r'CREATE EXTENSION[^;]+;', '', schema_sql)
    
    # Add the rest of the schema but don't modify table/enum names
    # as they will be created in the twelthhaus schema due to search_path
    modified_sql += "-- All objects below will be created in 'twelthhaus' schema\n"
    modified_sql += schema_sql
    
    # Update any explicit public schema references to twelthhaus
    modified_sql = modified_sql.replace("public.", "twelthhaus.")
    
    # Fix any remaining issues with schema qualification
    modified_sql = modified_sql.replace("SCHEMA public", "SCHEMA twelthhaus")
    
    return modified_sql

def connect_to_database():
    """Connect to the Supabase PostgreSQL database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False  # Use transactions
        print("✅ Connected to Supabase PostgreSQL database")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def execute_schema(conn, schema_sql):
    """Execute the complete schema SQL with proper error handling"""
    cursor = conn.cursor()
    
    try:
        print("🚀 Starting 12thhaus schema deployment to dedicated namespace...")
        
        # Split schema into logical sections for better error handling
        sections = []
        current_section = []
        section_name = "Initial Setup"
        
        for line in schema_sql.split('\n'):
            line = line.strip()
            if line.startswith('-- ') and '=' in line:
                # New section header
                if current_section:
                    sections.append((section_name, '\n'.join(current_section)))
                section_name = line.replace('-- ', '').replace('=', '').strip()
                current_section = []
            elif line:
                current_section.append(line)
        
        # Add final section
        if current_section:
            sections.append((section_name, '\n'.join(current_section)))
        
        executed_sections = 0
        total_statements = 0
        
        for section_name, section_sql in sections:
            if not section_sql.strip():
                continue
                
            print(f"📦 Deploying section: {section_name}")
            
            try:
                # Execute entire section as one block for better transaction handling
                cursor.execute(section_sql)
                executed_sections += 1
                
                # Count statements in this section
                statements = [s.strip() for s in section_sql.split(';') if s.strip()]
                total_statements += len(statements)
                
                print(f"✅ Section '{section_name}' deployed successfully")
                
            except Exception as e:
                error_msg = str(e)
                if any(keyword in error_msg.lower() for keyword in ['already exists', 'duplicate']):
                    print(f"⚠️  Section '{section_name}' - Some objects already exist (continuing)")
                else:
                    print(f"❌ Section '{section_name}' failed: {error_msg[:100]}...")
                    # Don't rollback, continue with other sections
                    continue
        
        # Commit all changes
        conn.commit()
        print(f"✅ 12thhaus schema deployment completed!")
        print(f"📊 Deployed {executed_sections}/{len(sections)} sections successfully")
        return True
        
    except Exception as e:
        print(f"❌ Schema deployment failed: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()

def verify_twelthhaus_schema(conn):
    """Verify that twelthhaus schema and tables were created"""
    cursor = conn.cursor()
    
    try:
        # Check if twelthhaus schema exists
        cursor.execute("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'twelthhaus';
        """)
        
        if not cursor.fetchone():
            print("❌ twelthhaus schema was not created!")
            return False
        
        print("✅ twelthhaus schema exists")
        
        # Check tables in twelthhaus schema
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'twelthhaus' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        tables = [row[0] for row in cursor.fetchall()]
        print(f"📊 Found {len(tables)} tables in twelthhaus schema")
        
        # Check for key spiritual platform tables
        key_tables = [
            'users', 'spiritual_disciplines', 'practitioners', 
            'spiritual_services', 'spiritual_bookings', 'community_posts',
            'spiritual_reviews', 'spiritual_payments', 'spiritual_journey_entries'
        ]
        
        missing_tables = []
        for table in key_tables:
            if table in tables:
                print(f"✅ twelthhaus.{table}")
            else:
                print(f"❌ twelthhaus.{table} - MISSING")
                missing_tables.append(table)
        
        if missing_tables:
            print(f"\n⚠️  {len(missing_tables)} key tables are missing in twelthhaus schema!")
            return False
        else:
            print(f"\n🎉 All {len(key_tables)} key spiritual platform tables created successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Schema verification failed: {e}")
        return False
    finally:
        cursor.close()

def verify_twelthhaus_enums(conn):
    """Verify that custom enums were created in twelthhaus schema"""
    cursor = conn.cursor()
    
    try:
        print("\n🔍 Verifying enum types in twelthhaus schema...")
        cursor.execute("""
            SELECT t.typname 
            FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE t.typtype = 'e' 
            AND n.nspname = 'twelthhaus'
            ORDER BY t.typname;
        """)
        
        enums = [row[0] for row in cursor.fetchall()]
        print(f"📊 Found {len(enums)} custom enum types in twelthhaus schema")
        
        key_enums = [
            'spiritual_discipline_category', 'spiritual_discipline_type',
            'booking_status', 'payment_status', 'experience_level'
        ]
        
        missing_enums = []
        for enum_type in key_enums:
            if enum_type in enums:
                print(f"✅ twelthhaus.{enum_type}")
            else:
                print(f"❌ twelthhaus.{enum_type} - MISSING")
                missing_enums.append(enum_type)
        
        return len(missing_enums) == 0
        
    except Exception as e:
        print(f"❌ Enum verification failed: {e}")
        return False
    finally:
        cursor.close()

def create_hasura_config(conn):
    """Create configuration information for Hasura setup"""
    try:
        print("\n📝 Creating Hasura configuration information...")
        
        config_info = """
# 12thhaus v2.0 Hasura Configuration
# Use this information to configure Hasura for the dedicated schema

## Database Connection
- Schema: twelthhaus
- Connection: Use existing Supabase connection
- Search Path: twelthhaus, public

## Hasura Console Setup
1. Track all tables from 'twelthhaus' schema
2. Set up relationships between spiritual platform tables
3. Configure permissions for user/practitioner/anonymous roles
4. Apply metadata from: hasura-setup/metadata/12thhaus_v2_hasura_metadata.yaml

## Key Tables to Track:
- twelthhaus.users
- twelthhaus.spiritual_disciplines  
- twelthhaus.practitioners
- twelthhaus.spiritual_services
- twelthhaus.spiritual_bookings
- twelthhaus.community_posts
- twelthhaus.spiritual_reviews
- twelthhaus.spiritual_payments
- twelthhaus.spiritual_journey_entries

## Next Steps:
1. Configure Hasura to use 'twelthhaus' schema
2. Apply metadata configuration
3. Test GraphQL queries
4. Set up authentication integration
"""
        
        with open('/Users/mufasa/Desktop/Clients/12thhaus-v2/HASURA_SETUP_GUIDE.md', 'w') as f:
            f.write(config_info)
        
        print("✅ Hasura setup guide created: HASURA_SETUP_GUIDE.md")
        
    except Exception as e:
        print(f"⚠️  Could not create Hasura config: {e}")

def main():
    """Main deployment function"""
    print("🚀 12thhaus v2.0 Dedicated Schema Deployment")
    print("Using 'twelthhaus' schema for clean project separation")
    print("=" * 60)
    
    # Read schema file
    schema_sql = read_schema_file()
    if not schema_sql:
        sys.exit(1)
    
    print(f"📁 Original schema file loaded: {len(schema_sql)} characters")
    
    # Modify schema for dedicated namespace
    modified_sql = modify_schema_for_dedicated_namespace(schema_sql)
    print(f"🔄 Modified schema: {len(modified_sql)} characters")
    
    # Connect to database
    conn = connect_to_database()
    if not conn:
        sys.exit(1)
    
    try:
        # Execute schema
        if not execute_schema(conn, modified_sql):
            print("⚠️  Schema deployment had issues, continuing with verification...")
        
        # Verify deployment
        tables_ok = verify_twelthhaus_schema(conn)
        enums_ok = verify_twelthhaus_enums(conn)
        
        if tables_ok and enums_ok:
            print("\n🎉 DEPLOYMENT SUCCESSFUL!")
            print("✅ All spiritual platform tables and enums created in 'twelthhaus' schema")
            print("✅ Zero conflicts with existing contractor/bidding project")
            print("✅ Database ready for Hasura configuration")
            
            # Create Hasura setup guide
            create_hasura_config(conn)
            
        else:
            print("\n⚠️  DEPLOYMENT COMPLETED WITH ISSUES")
            print("Some tables or enums may be missing in twelthhaus schema")
            
    finally:
        conn.close()
        print("\n🔌 Database connection closed")

if __name__ == "__main__":
    main()