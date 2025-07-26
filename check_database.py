#!/usr/bin/env python3
"""
Database Inspector for 12thhaus v2.0
Check current database state before deployment
"""

import psycopg2
import sys

DATABASE_URL = "postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres"

def connect_to_database():
    """Connect to the Supabase PostgreSQL database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("✅ Connected to Supabase PostgreSQL database")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def check_existing_tables(conn):
    """Check existing tables in the database"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT table_name, table_schema
            FROM information_schema.tables 
            WHERE table_schema IN ('public', 'auth', 'storage', 'realtime')
            ORDER BY table_schema, table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"\n📊 Found {len(tables)} existing tables:")
        
        for table_name, schema in tables:
            print(f"  📁 {schema}.{table_name}")
            
        return tables
        
    except Exception as e:
        print(f"❌ Failed to check tables: {e}")
        return []
    finally:
        cursor.close()

def check_existing_enums(conn):
    """Check existing enum types"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT typname, nspname
            FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE typtype = 'e'
            ORDER BY nspname, typname;
        """)
        
        enums = cursor.fetchall()
        print(f"\n🏷️  Found {len(enums)} existing enum types:")
        
        for enum_name, schema in enums:
            print(f"  🔖 {schema}.{enum_name}")
            
        return enums
        
    except Exception as e:
        print(f"❌ Failed to check enums: {e}")
        return []
    finally:
        cursor.close()

def check_functions(conn):
    """Check existing functions"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT routine_name, routine_schema
            FROM information_schema.routines
            WHERE routine_schema = 'public'
            ORDER BY routine_name;
        """)
        
        functions = cursor.fetchall()
        print(f"\n⚙️  Found {len(functions)} existing functions:")
        
        for func_name, schema in functions[:10]:  # Limit to first 10
            print(f"  🔧 {schema}.{func_name}")
            
        if len(functions) > 10:
            print(f"  ... and {len(functions) - 10} more")
            
        return functions
        
    except Exception as e:
        print(f"❌ Failed to check functions: {e}")
        return []
    finally:
        cursor.close()

def check_extensions(conn):
    """Check installed extensions"""
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT extname, extversion
            FROM pg_extension
            ORDER BY extname;
        """)
        
        extensions = cursor.fetchall()
        print(f"\n🔌 Found {len(extensions)} installed extensions:")
        
        for ext_name, version in extensions:
            print(f"  📦 {ext_name} v{version}")
            
        return extensions
        
    except Exception as e:
        print(f"❌ Failed to check extensions: {e}")
        return []
    finally:
        cursor.close()

def main():
    """Main inspection function"""
    print("🔍 12thhaus Database State Inspector")
    print("=" * 40)
    
    conn = connect_to_database()
    if not conn:
        sys.exit(1)
    
    try:
        tables = check_existing_tables(conn)
        enums = check_existing_enums(conn)
        functions = check_functions(conn)
        extensions = check_extensions(conn)
        
        print(f"\n📋 Summary:")
        print(f"  📁 Tables: {len(tables)}")
        print(f"  🏷️  Enums: {len(enums)}")
        print(f"  ⚙️  Functions: {len(functions)}")
        print(f"  🔌 Extensions: {len(extensions)}")
        
        # Check if we need to clear anything
        spiritual_tables = [t for t in tables if 'spiritual' in t[0].lower() or 'practitioner' in t[0].lower()]
        if spiritual_tables:
            print(f"\n⚠️  Found {len(spiritual_tables)} existing spiritual-related tables")
            print("Consider dropping these before fresh deployment")
            
    finally:
        conn.close()
        print("\n🔌 Database connection closed")

if __name__ == "__main__":
    main()