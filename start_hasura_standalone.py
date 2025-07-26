#!/usr/bin/env python3
"""
Start Hasura in standalone mode without initial database requirement
Configure database connection after console is accessible
"""

import subprocess
import time
import requests
import json
import sys

def start_hasura_standalone():
    """Start Hasura without requiring database connection at startup"""
    try:
        print("🚀 Starting Hasura in standalone mode...")
        
        # Stop any existing containers
        subprocess.run(["docker", "stop", "12thhaus-hasura-standalone"], 
                      capture_output=True, check=False)
        subprocess.run(["docker", "rm", "12thhaus-hasura-standalone"], 
                      capture_output=True, check=False)
        
        # Start Hasura without database URL (will start in metadata-only mode)
        hasura_cmd = [
            "docker", "run", "-d",
            "--name", "12thhaus-hasura-standalone",
            "-p", "8080:8080",
            "-e", "HASURA_GRAPHQL_ADMIN_SECRET=3GnFK5l1bySIMsKQ46IAAf2IzSQ7Is1RvlXaGAh4M1vZqLlRKmRPk1w76Mdq0eQq",
            "-e", "HASURA_GRAPHQL_ENABLE_CONSOLE=true",
            "-e", "HASURA_GRAPHQL_DEV_MODE=true",
            "-e", "HASURA_GRAPHQL_ENABLED_LOG_TYPES=startup, http-log, webhook-log, websocket-log, query-log",
            "-e", "HASURA_GRAPHQL_CORS_DOMAIN=*",
            "-e", "HASURA_GRAPHQL_ENABLE_ALLOWLIST=false",
            "-e", "HASURA_GRAPHQL_METADATA_DATABASE_URL=postgres://",  # Dummy URL, will be replaced
            "hasura/graphql-engine:v2.33.4"
        ]
        
        result = subprocess.run(hasura_cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Failed to start Hasura: {result.stderr}")
            return False
        
        container_id = result.stdout.strip()
        print(f"✅ Hasura container started: {container_id[:12]}")
        
        # Wait for Hasura to be accessible
        print("⏳ Waiting for Hasura to be accessible...")
        
        for attempt in range(30):  # 30 second timeout
            try:
                response = requests.get("http://localhost:8080/v1/version", timeout=3)
                if response.status_code == 200:
                    print("✅ Hasura is accessible!")
                    return True
            except:
                pass
            
            time.sleep(1)
            print(f"   Attempt {attempt + 1}/30...")
        
        print("❌ Hasura failed to start within 30 seconds")
        return False
        
    except Exception as e:
        print(f"❌ Error starting Hasura: {e}")
        return False

def configure_database_source():
    """Configure Supabase database source in running Hasura"""
    try:
        print("🔗 Configuring Supabase database source...")
        
        # Test if we can add the database source
        headers = {
            "Content-Type": "application/json",
            "x-hasura-admin-secret": "3GnFK5l1bySIMsKQ46IAAf2IzSQ7Is1RvlXaGAh4M1vZqLlRKmRPk1w76Mdq0eQq"
        }
        
        # Try different database URLs
        database_urls = [
            "postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres?sslmode=require",
            "postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:6543/postgres?sslmode=require"
        ]
        
        for i, db_url in enumerate(database_urls):
            print(f"🧪 Testing database URL {i+1}...")
            
            add_source_query = {
                "type": "pg_add_source",
                "args": {
                    "name": "default",
                    "configuration": {
                        "connection_info": {
                            "database_url": db_url,
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
            
            try:
                response = requests.post(
                    "http://localhost:8080/v1/metadata",
                    headers=headers,
                    json=add_source_query,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("message") == "success":
                        print(f"✅ Database source configured successfully with URL {i+1}")
                        return True
                    else:
                        print(f"⚠️  URL {i+1} failed: {result}")
                else:
                    print(f"❌ URL {i+1} HTTP error: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ URL {i+1} error: {e}")
        
        print("⚠️  Database source configuration failed, but console should still work")
        print("📋 Use manual console configuration at http://localhost:8080")
        return False
        
    except Exception as e:
        print(f"❌ Error configuring database: {e}")
        return False

def test_console_access():
    """Test that Hasura console is accessible"""
    try:
        print("🧪 Testing Hasura console access...")
        
        response = requests.get("http://localhost:8080/console", timeout=10)
        
        if response.status_code == 200:
            print("✅ Hasura console accessible at http://localhost:8080/console")
            return True
        else:
            print(f"❌ Console access failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Console test error: {e}")
        return False

def main():
    """Main standalone Hasura setup"""
    print("🚀 12thhaus Hasura Standalone Setup")
    print("Starting Hasura without database requirement")
    print("=" * 50)
    
    # Step 1: Start Hasura in standalone mode
    if not start_hasura_standalone():
        print("❌ Failed to start Hasura")
        return False
    
    print()
    
    # Step 2: Test console access
    if not test_console_access():
        print("❌ Console not accessible")
        return False
    
    print()
    
    # Step 3: Try to configure database (optional)
    database_configured = configure_database_source()
    
    print()
    print("📋 HASURA STANDALONE SETUP COMPLETE")
    print("=" * 40)
    print("✅ Hasura Console: http://localhost:8080/console")
    print("✅ Admin Secret: 3GnFK5l1bySIMsKQ46IAAf2IzSQ7Is1RvlXaGAh4M1vZqLlRKmRPk1w76Mdq0eQq")
    
    if database_configured:
        print("✅ Database: Automatically configured")
        print("🎯 Ready for table tracking and GraphQL testing")
    else:
        print("⚠️  Database: Manual configuration required")
        print("📖 Use console to manually add database connection:")
        print("   - Database Name: default") 
        print("   - URL: postgresql://postgres:Paysoz991@###@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres?sslmode=require")
    
    print("\n🎯 Next Steps:")
    print("1. Open http://localhost:8080/console")
    print("2. Add database connection (if not automatic)")
    print("3. Track tables from 'twelthhaus' schema")
    print("4. Test GraphQL queries")
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print(f"\n🎉 SUCCESS: Hasura standalone setup complete")
        sys.exit(0)
    else:
        print(f"\n❌ FAILED: Hasura standalone setup failed")
        sys.exit(1)