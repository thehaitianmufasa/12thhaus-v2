#!/usr/bin/env python3
"""
Investigate Supabase Connection Requirements for Hasura Cloud
Determine the correct connection configuration
"""

import requests
import json
import psycopg2
import sys

# Supabase configuration
SUPABASE_PROJECT_REF = "xgfkhrxabdkjkzduvqnu"
SUPABASE_ACCESS_TOKEN = "sbp_0a9932aed71424e8c035d584a76a1e6cb6e84b25"

# Database connection details
DATABASE_URL = "postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres"

# Hasura Cloud configuration
HASURA_METADATA_ENDPOINT = "https://probable-donkey-61.hasura.app/v1/metadata"
HASURA_ADMIN_SECRET = "3GnFK5l1bySIMsKQ46IAAf2IzSQ7Is1RvlXaGAh4M1vZqLlRKmRPk1w76Mdq0eQq"

def test_direct_database_connection():
    """Test our direct database connection works"""
    try:
        print("🔍 Testing direct database connection...")
        
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # Test basic query
        cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'twelthhaus';")
        table_count = cursor.fetchone()[0]
        
        print(f"✅ Direct connection works - {table_count} tables in twelthhaus schema")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Direct connection failed: {e}")
        return False

def get_supabase_connection_info():
    """Get proper Supabase connection details"""
    try:
        print("🔍 Getting Supabase connection configuration...")
        
        # Get project settings
        headers = {
            "Authorization": f"Bearer {SUPABASE_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }
        
        # Get project details
        project_url = f"https://api.supabase.com/v1/projects/{SUPABASE_PROJECT_REF}"
        
        response = requests.get(project_url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            project_data = response.json()
            
            print("✅ Project details retrieved:")
            print(f"  Name: {project_data.get('name', 'Unknown')}")
            print(f"  Region: {project_data.get('region', 'Unknown')}")
            print(f"  Status: {project_data.get('status', 'Unknown')}")
            
            # Get database settings
            db_host = project_data.get('database', {}).get('host', f"db.{SUPABASE_PROJECT_REF}.supabase.co")
            db_port = project_data.get('database', {}).get('port', 5432)
            
            print(f"  Database Host: {db_host}")
            print(f"  Database Port: {db_port}")
            
            return {
                "host": db_host,
                "port": db_port,
                "database": "postgres",
                "user": "postgres",
                "project_ref": SUPABASE_PROJECT_REF
            }
            
        else:
            print(f"⚠️  Could not get project details: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error getting Supabase info: {e}")
        return None

def test_hasura_connection_with_pooler():
    """Test connection using Supabase connection pooler"""
    try:
        print("🔍 Testing Hasura connection with Supabase pooler...")
        
        # Supabase connection pooler URL format
        pooler_url = f"postgresql://postgres:Paysoz991%40%23%23%23@db.{SUPABASE_PROJECT_REF}.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
        
        print(f"📋 Pooler URL: {pooler_url}")
        
        headers = {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": HASURA_ADMIN_SECRET
        }
        
        add_source_query = {
            "type": "pg_add_source",
            "args": {
                "name": "test_pooler",
                "configuration": {
                    "connection_info": {
                        "database_url": pooler_url,
                        "isolation_level": "read-committed",
                        "pool_settings": {
                            "connection_lifetime": 300,
                            "idle_timeout": 30,
                            "max_connections": 20,
                            "retries": 1
                        },
                        "use_prepared_statements": False  # Important for pooler
                    }
                }
            }
        }
        
        response = requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=headers,
            json=add_source_query,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("message") == "success":
                print("✅ SUCCESS: Pooler connection works!")
                
                # Clean up test source
                cleanup_query = {
                    "type": "pg_drop_source",
                    "args": {
                        "name": "test_pooler",
                        "cascade": True
                    }
                }
                
                requests.post(
                    HASURA_METADATA_ENDPOINT,
                    headers=headers,
                    json=cleanup_query,
                    timeout=15
                )
                
                return pooler_url
            else:
                print(f"❌ Pooler connection failed: {result}")
                return None
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error testing pooler: {e}")
        return None

def test_hasura_connection_with_ipv4():
    """Test connection forcing IPv4"""
    try:
        print("🔍 Testing with IPv4 connection...")
        
        # Try with explicit IPv4 settings
        ipv4_url = f"postgresql://postgres:Paysoz991%40%23%23%23@db.{SUPABASE_PROJECT_REF}.supabase.co:5432/postgres?sslmode=require&connect_timeout=30"
        
        headers = {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": HASURA_ADMIN_SECRET
        }
        
        add_source_query = {
            "type": "pg_add_source",
            "args": {
                "name": "test_ipv4",
                "configuration": {
                    "connection_info": {
                        "database_url": ipv4_url,
                        "isolation_level": "read-committed",
                        "pool_settings": {
                            "connection_lifetime": 600,
                            "idle_timeout": 180,
                            "max_connections": 50,
                            "retries": 3
                        },
                        "use_prepared_statements": True
                    }
                }
            }
        }
        
        response = requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=headers,
            json=add_source_query,
            timeout=45
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("message") == "success":
                print("✅ SUCCESS: IPv4 connection works!")
                
                # Clean up test source
                cleanup_query = {
                    "type": "pg_drop_source",
                    "args": {
                        "name": "test_ipv4",
                        "cascade": True
                    }
                }
                
                requests.post(
                    HASURA_METADATA_ENDPOINT,
                    headers=headers,
                    json=cleanup_query,
                    timeout=15
                )
                
                return ipv4_url
            else:
                print(f"❌ IPv4 connection failed: {result}")
                return None
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error testing IPv4: {e}")
        return None

def main():
    """Main investigation function"""
    print("🚀 12thhaus Supabase-Hasura Connection Investigation")
    print("Finding the correct connection configuration")
    print("=" * 60)
    
    # Step 1: Verify our direct connection works
    if not test_direct_database_connection():
        print("❌ Cannot proceed - direct database connection failed")
        return False
    
    print()
    
    # Step 2: Get Supabase connection info
    supabase_info = get_supabase_connection_info()
    if supabase_info:
        print("✅ Supabase project accessible")
    else:
        print("⚠️  Could not get detailed Supabase info")
    
    print()
    
    # Step 3: Test connection pooler (recommended for Hasura)
    working_pooler = test_hasura_connection_with_pooler()
    
    print()
    
    # Step 4: Test IPv4 connection if pooler fails
    working_ipv4 = test_hasura_connection_with_ipv4()
    
    print()
    print("📋 Investigation Results")
    print("=" * 30)
    
    if working_pooler:
        print("🎉 SOLUTION FOUND: Use Supabase Connection Pooler")
        print(f"✅ Working URL: {working_pooler}")
        print("📋 Key settings: pgbouncer=true, use_prepared_statements=false")
        return working_pooler
    elif working_ipv4:
        print("🎉 SOLUTION FOUND: Use IPv4 Direct Connection")
        print(f"✅ Working URL: {working_ipv4}")
        print("📋 Key settings: connect_timeout=30, retries=3")
        return working_ipv4
    else:
        print("❌ NO WORKING CONNECTION FOUND")
        print("📋 This indicates a deeper network/firewall issue")
        print("📞 May require Supabase or Hasura Cloud support")
        return None

if __name__ == "__main__":
    working_url = main()
    if working_url:
        print(f"\n🎯 Next step: Use this working URL to configure Hasura default source")
        sys.exit(0)
    else:
        sys.exit(1)