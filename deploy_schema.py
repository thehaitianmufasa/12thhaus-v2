#!/usr/bin/env python3
"""
Database Schema Deployment Script for 12thhaus v2.0
Deploys complete PostgreSQL schema to Supabase database
"""

import psycopg2
import os
import sys
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
    """Execute the complete schema SQL"""
    cursor = conn.cursor()
    
    try:
        print("🚀 Starting schema deployment...")
        
        # Split schema into individual statements for better error handling
        statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
        
        executed_statements = 0
        for i, statement in enumerate(statements):
            if statement:
                try:
                    cursor.execute(statement)
                    executed_statements += 1
                    if executed_statements % 10 == 0:
                        print(f"📊 Executed {executed_statements}/{len(statements)} statements...")
                except Exception as e:
                    print(f"⚠️  Statement {i+1} failed (might be expected): {str(e)[:100]}...")
                    continue
        
        # Commit all changes
        conn.commit()
        print(f"✅ Schema deployment completed! Executed {executed_statements} statements successfully.")
        return True
        
    except Exception as e:
        print(f"❌ Schema deployment failed: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()

def verify_tables(conn):
    """Verify that tables were created successfully"""
    cursor = conn.cursor()
    
    try:
        # Check for key tables
        key_tables = [
            'users', 'spiritual_disciplines', 'practitioners', 
            'spiritual_services', 'spiritual_bookings', 'community_posts',
            'service_reviews', 'spiritual_payments', 'spiritual_journey_entries'
        ]
        
        print("\n🔍 Verifying table creation...")
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        existing_tables = [row[0] for row in cursor.fetchall()]
        print(f"📊 Found {len(existing_tables)} tables in database")
        
        # Check for key tables
        missing_tables = []
        for table in key_tables:
            if table in existing_tables:
                print(f"✅ {table}")
            else:
                print(f"❌ {table} - MISSING")
                missing_tables.append(table)
        
        if missing_tables:
            print(f"\n⚠️  {len(missing_tables)} key tables are missing!")
            return False
        else:
            print(f"\n🎉 All {len(key_tables)} key tables created successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Table verification failed: {e}")
        return False
    finally:
        cursor.close()

def verify_enums(conn):
    """Verify that custom enums were created"""
    cursor = conn.cursor()
    
    try:
        print("\n🔍 Verifying enum types...")
        cursor.execute("""
            SELECT typname 
            FROM pg_type 
            WHERE typtype = 'e' 
            AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            ORDER BY typname;
        """)
        
        enums = [row[0] for row in cursor.fetchall()]
        print(f"📊 Found {len(enums)} custom enum types")
        
        key_enums = [
            'spiritual_discipline_category', 'spiritual_discipline_type',
            'booking_status', 'payment_status', 'experience_level'
        ]
        
        missing_enums = []
        for enum_type in key_enums:
            if enum_type in enums:
                print(f"✅ {enum_type}")
            else:
                print(f"❌ {enum_type} - MISSING")
                missing_enums.append(enum_type)
        
        return len(missing_enums) == 0
        
    except Exception as e:
        print(f"❌ Enum verification failed: {e}")
        return False
    finally:
        cursor.close()

def main():
    """Main deployment function"""
    print("🚀 12thhaus v2.0 Database Schema Deployment")
    print("=" * 50)
    
    # Read schema file
    schema_sql = read_schema_file()
    if not schema_sql:
        sys.exit(1)
    
    print(f"📁 Schema file loaded: {len(schema_sql)} characters")
    
    # Connect to database
    conn = connect_to_database()
    if not conn:
        sys.exit(1)
    
    try:
        # Execute schema
        if not execute_schema(conn, schema_sql):
            sys.exit(1)
        
        # Verify deployment
        tables_ok = verify_tables(conn)
        enums_ok = verify_enums(conn)
        
        if tables_ok and enums_ok:
            print("\n🎉 DEPLOYMENT SUCCESSFUL!")
            print("✅ All tables and enums created successfully")
            print("✅ Database schema ready for 12thhaus v2.0")
        else:
            print("\n⚠️  DEPLOYMENT COMPLETED WITH ISSUES")
            print("Some tables or enums may be missing")
            
    finally:
        conn.close()
        print("🔌 Database connection closed")

if __name__ == "__main__":
    main()