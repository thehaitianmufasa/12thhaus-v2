#!/usr/bin/env python3
"""
Test Hasura Connection with SSL Configuration
Try different connection string formats for Supabase
"""

import requests
import json
import sys

HASURA_METADATA_ENDPOINT = "https://probable-donkey-61.hasura.app/v1/metadata"
HASURA_ADMIN_SECRET = "3GnFK5l1bySIMsKQ46IAAf2IzSQ7Is1RvlXaGAh4M1vZqLlRKmRPk1w76Mdq0eQq"

def get_headers():
    """Get headers for Hasura API requests"""
    return {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET
    }

def test_connection_strings():
    """Test different database connection string formats"""
    
    connection_strings = [
        {
            "name": "Standard with SSL",
            "url": "postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres?sslmode=require"
        },
        {
            "name": "With SSL and search path",
            "url": "postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres?sslmode=require&options=-csearch_path%3Dtwelthhaus%2Cpublic"
        },
        {
            "name": "Alternative encoding",
            "url": "postgres://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres?sslmode=require"
        },
        {
            "name": "With SSL verify",
            "url": "postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres?sslmode=verify-full"
        }
    ]
    
    for i, conn_test in enumerate(connection_strings):
        print(f"\n🔍 Testing connection {i+1}: {conn_test['name']}")
        
        try:
            add_source_query = {
                "type": "pg_add_source",
                "args": {
                    "name": f"test_source_{i+1}",
                    "configuration": {
                        "connection_info": {
                            "database_url": conn_test["url"],
                            "isolation_level": "read-committed",
                            "pool_settings": {
                                "connection_lifetime": 600,
                                "idle_timeout": 180, 
                                "max_connections": 50,
                                "retries": 1
                            },
                            "use_prepared_statements": True
                        }
                    }
                }
            }
            
            response = requests.post(
                HASURA_METADATA_ENDPOINT,
                headers=get_headers(),
                json=add_source_query,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("message") == "success":
                    print(f"✅ SUCCESS: {conn_test['name']}")
                    
                    # Clean up test source
                    cleanup_query = {
                        "type": "pg_drop_source",
                        "args": {
                            "name": f"test_source_{i+1}",
                            "cascade": True
                        }
                    }
                    
                    requests.post(
                        HASURA_METADATA_ENDPOINT,
                        headers=get_headers(),
                        json=cleanup_query,
                        timeout=15
                    )
                    
                    return conn_test["url"]  # Return working connection string
                else:
                    print(f"❌ FAILED: {result}")
            else:
                print(f"❌ HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
    
    return None

def add_working_source(working_url):
    """Add the working database source as default"""
    try:
        print(f"\n🔗 Adding working database source as 'default'...")
        
        add_source_query = {
            "type": "pg_add_source",
            "args": {
                "name": "default",
                "configuration": {
                    "connection_info": {
                        "database_url": working_url,
                        "isolation_level": "read-committed",
                        "pool_settings": {
                            "connection_lifetime": 600,
                            "idle_timeout": 180,
                            "max_connections": 50,
                            "retries": 1
                        },
                        "use_prepared_statements": True
                    }
                }
            }
        }
        
        response = requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=get_headers(),
            json=add_source_query,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("message") == "success":
                print("✅ Default database source added successfully")
                return True
            else:
                if "already exists" in str(result).lower():
                    print("✅ Default source already exists")
                    return True
                print(f"⚠️  Add source result: {result}")
                return False
        else:
            print(f"❌ Failed to add source: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error adding source: {e}")
        return False

def quick_table_test():
    """Quick test to track one table"""
    try:
        print("\n🧪 Quick test: tracking spiritual_disciplines table...")
        
        track_query = {
            "type": "pg_track_table",
            "args": {
                "source": "default",
                "table": {
                    "schema": "twelthhaus",
                    "name": "spiritual_disciplines"
                }
            }
        }
        
        response = requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=get_headers(),
            json=track_query,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("message") == "success":
                print("✅ Successfully tracked spiritual_disciplines table")
                return True
            else:
                if "already tracked" in str(result).lower():
                    print("✅ Table already tracked")
                    return True
                print(f"⚠️  Track result: {result}")
                return False
        else:
            print(f"❌ Failed to track table: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error tracking table: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 12thhaus Hasura SSL Connection Test")
    print("Testing different connection string formats")
    print("=" * 50)
    
    # Test different connection strings
    working_url = test_connection_strings()
    
    if working_url:
        print(f"\n🎉 Found working connection string!")
        print(f"📋 Working URL: {working_url}")
        
        # Add as default source
        if add_working_source(working_url):
            print("\n✅ Database source configured successfully")
            
            # Quick table test
            if quick_table_test():
                print("\n🎉 HASURA DATABASE CONNECTION SUCCESSFUL!")
                print("✅ Ready to proceed with full table tracking")
                print("✅ Connection string validated and working")
                return True
            else:
                print("\n⚠️  Database connected but table access failed")
                return False
        else:
            print("\n❌ Failed to configure database source")
            return False
    else:
        print("\n❌ No working connection string found")
        print("📋 Manual Hasura Console configuration required")
        print("📖 See HASURA_MANUAL_SETUP_GUIDE.md for instructions")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)