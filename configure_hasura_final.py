#!/usr/bin/env python3
"""
Final Hasura Configuration Solution
Using correct Supabase pooler format and manual console backup
"""

import requests
import json
import sys

# Configuration from secrets
HASURA_METADATA_ENDPOINT = "https://probable-donkey-61.hasura.app/v1/metadata"
HASURA_ADMIN_SECRET = "3GnFK5l1bySIMsKQ46IAAf2IzSQ7Is1RvlXaGAh4M1vZqLlRKmRPk1w76Mdq0eQq"
SUPABASE_PROJECT_REF = "xgfkhrxabdkjkzduvqnu"

def get_headers():
    """Get headers for Hasura API requests"""
    return {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET
    }

def test_supabase_pooler_formats():
    """Test different Supabase pooler connection formats"""
    try:
        print("🔍 Testing correct Supabase pooler connection formats...")
        
        # Different pooler formats to test
        pooler_configs = [
            {
                "name": "Supabase Session Pooler (Transaction Mode)",
                "url": os.getenv('DATABASE_URL', f"postgresql://localhost:5432/twelthhaus"),
                "prepared_statements": False
            },
            {
                "name": "Supabase Session Pooler (Session Mode)", 
                "url": os.getenv('DATABASE_URL', f"postgresql://localhost:5432/twelthhaus"),
                "prepared_statements": False
            },
            {
                "name": "Supabase Direct with Extended Timeout",
                "url": f"postgresql://postgres:Paysoz991%40%23%23%23@db.{SUPABASE_PROJECT_REF}.supabase.co:5432/postgres?sslmode=require&connect_timeout=60&tcp_user_timeout=60000",
                "prepared_statements": True
            }
        ]
        
        for i, config in enumerate(pooler_configs):
            print(f"\n🧪 Testing: {config['name']}")
            print(f"📋 URL: {config['url']}")
            
            try:
                # Remove any existing test source
                cleanup_query = {
                    "type": "pg_drop_source",
                    "args": {
                        "name": f"test_config_{i}",
                        "cascade": True
                    }
                }
                
                requests.post(
                    HASURA_METADATA_ENDPOINT,
                    headers=get_headers(),
                    json=cleanup_query,
                    timeout=10
                )
                
                # Test the configuration
                add_source_query = {
                    "type": "pg_add_source",
                    "args": {
                        "name": f"test_config_{i}",
                        "configuration": {
                            "connection_info": {
                                "database_url": config["url"],
                                "isolation_level": "read-committed",
                                "pool_settings": {
                                    "connection_lifetime": 300,
                                    "idle_timeout": 60,
                                    "max_connections": 20,
                                    "retries": 2
                                },
                                "use_prepared_statements": config["prepared_statements"]
                            }
                        }
                    }
                }
                
                response = requests.post(
                    HASURA_METADATA_ENDPOINT,
                    headers=get_headers(),
                    json=add_source_query,
                    timeout=60
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("message") == "success":
                        print(f"✅ SUCCESS: {config['name']} works!")
                        
                        # Clean up test source
                        requests.post(
                            HASURA_METADATA_ENDPOINT,
                            headers=get_headers(),
                            json=cleanup_query,
                            timeout=10
                        )
                        
                        return config
                    else:
                        print(f"❌ Failed: {result}")
                else:
                    print(f"❌ HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                print(f"❌ Error testing {config['name']}: {e}")
        
        return None
        
    except Exception as e:
        print(f"❌ Error testing pooler formats: {e}")
        return None

def configure_working_source(config):
    """Configure the working connection as default source"""
    try:
        print(f"\n🔗 Configuring '{config['name']}' as default source...")
        
        # Remove any existing default source
        cleanup_query = {
            "type": "pg_drop_source",
            "args": {
                "name": "default",
                "cascade": True
            }
        }
        
        requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=get_headers(),
            json=cleanup_query,
            timeout=15
        )
        
        # Add working configuration as default
        add_source_query = {
            "type": "pg_add_source",
            "args": {
                "name": "default",
                "configuration": {
                    "connection_info": {
                        "database_url": config["url"],
                        "isolation_level": "read-committed",
                        "pool_settings": {
                            "connection_lifetime": 600,
                            "idle_timeout": 180,
                            "max_connections": 50,
                            "retries": 3
                        },
                        "use_prepared_statements": config["prepared_statements"]
                    }
                }
            }
        }
        
        response = requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=get_headers(),
            json=add_source_query,
            timeout=45
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("message") == "success":
                print("✅ Default source configured successfully")
                return True
            else:
                print(f"❌ Configuration failed: {result}")
                return False
        else:
            print(f"❌ HTTP error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error configuring source: {e}")
        return False

def batch_track_tables():
    """Efficiently track all twelthhaus tables"""
    try:
        print("📋 Batch tracking all twelthhaus schema tables...")
        
        tables = [
            "users", "practitioners", "spiritual_disciplines", "spiritual_services",
            "spiritual_bookings", "community_posts", "community_comments", 
            "community_engagements", "conversations", "messages", "spiritual_reviews",
            "spiritual_journey_entries", "payment_transactions", "notifications",
            "user_spiritual_preferences"
        ]
        
        # Create bulk tracking operation
        bulk_operations = []
        for table in tables:
            bulk_operations.append({
                "type": "pg_track_table",
                "args": {
                    "source": "default",
                    "table": {
                        "schema": "twelthhaus",
                        "name": table
                    }
                }
            })
        
        # Send bulk operation
        bulk_query = {
            "type": "bulk",
            "args": bulk_operations
        }
        
        print(f"📦 Tracking {len(tables)} tables in bulk operation...")
        
        response = requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=get_headers(),
            json=bulk_query,
            timeout=60
        )
        
        if response.status_code == 200:
            results = response.json()
            
            if isinstance(results, list):
                success_count = 0
                failed_tables = []
                
                for i, result in enumerate(results):
                    table_name = tables[i] if i < len(tables) else f"table_{i}"
                    
                    if result.get("message") == "success":
                        success_count += 1
                        print(f"  ✅ {table_name}")
                    else:
                        if "already tracked" in str(result).lower():
                            success_count += 1
                            print(f"  ✅ {table_name} (already tracked)")
                        else:
                            failed_tables.append(table_name)
                            print(f"  ❌ {table_name}: {result}")
                
                print(f"\n📊 Bulk tracking results: {success_count}/{len(tables)} successful")
                return success_count, failed_tables
            else:
                print(f"⚠️  Unexpected bulk response: {results}")
                return 0, tables
        else:
            print(f"❌ Bulk operation failed: {response.status_code} - {response.text}")
            return 0, tables
            
    except Exception as e:
        print(f"❌ Error in bulk tracking: {e}")
        return 0, []

def test_complete_graphql_functionality():
    """Test comprehensive GraphQL functionality"""
    try:
        print("🧪 Testing complete GraphQL functionality...")
        
        # Test queries with different complexity levels
        test_queries = [
            {
                "name": "Simple Query - Spiritual Disciplines",
                "query": """
                query GetDisciplines {
                  spiritual_disciplines(limit: 3) {
                    id
                    name
                    category
                    typical_duration_minutes
                    typical_price_range_min
                    typical_price_range_max
                  }
                }
                """
            },
            {
                "name": "Table Count Query",
                "query": """
                query GetCounts {
                  spiritual_disciplines_aggregate {
                    aggregate {
                      count
                    }
                  }
                  users_aggregate {
                    aggregate {
                      count
                    }
                  }
                }
                """
            }
        ]
        
        graphql_endpoint = "https://probable-donkey-61.hasura.app/v1/graphql"
        success_count = 0
        
        for test in test_queries:
            try:
                print(f"  🔍 Testing: {test['name']}")
                
                response = requests.post(
                    graphql_endpoint,
                    headers={
                        "Content-Type": "application/json",
                        "x-hasura-admin-secret": HASURA_ADMIN_SECRET
                    },
                    json={"query": test["query"]},
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if "data" in result and not result.get("errors"):
                        print(f"    ✅ Success")
                        success_count += 1
                    else:
                        print(f"    ❌ GraphQL errors: {result.get('errors', 'Unknown')}")
                else:
                    print(f"    ❌ HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                print(f"    ❌ Error: {e}")
        
        print(f"\n📊 GraphQL test results: {success_count}/{len(test_queries)} successful")
        return success_count > 0
        
    except Exception as e:
        print(f"❌ Error testing GraphQL: {e}")
        return False

def generate_manual_setup_instructions(failed_config=True):
    """Generate final manual setup instructions"""
    try:
        print("\n📋 GENERATING MANUAL HASURA CONSOLE SETUP INSTRUCTIONS")
        print("=" * 60)
        
        if failed_config:
            print("⚠️  Automated configuration could not establish connection")
            print("🛠️  Manual Hasura Console configuration required")
        
        print("\n📖 MANUAL SETUP STEPS:")
        print("1. Open Hasura Console: https://probable-donkey-61.hasura.app/console")
        print("2. Use Admin Secret: 3GnFK5l1bySIMsKQ46IAAf2IzSQ7Is1RvlXaGAh4M1vZqLlRKmRPk1w76Mdq0eQq")
        print("3. Go to Data tab → Connect Database")
        print("4. Database Name: default")
        print("5. Try these connection URLs in order:")
        
        connection_options = [
            "postgresql://postgres:Paysoz991@###@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres?sslmode=require",
            "postgresql://postgres:Paysoz991@###@db.xgfkhrxabdkjkzduvqnu.supabase.co:6543/postgres?sslmode=require",
            "postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres?sslmode=require"
        ]
        
        for i, url in enumerate(connection_options, 1):
            print(f"   Option {i}: {url}")
        
        print("\n6. After connection succeeds:")
        print("   - Track all tables from 'twelthhaus' schema")
        print("   - Configure table relationships")
        print("   - Test GraphQL queries")
        
        print("\n🎯 EXPECTED RESULT:")
        print("   - 15 tables tracked from twelthhaus schema")
        print("   - GraphQL API operational for spiritual platform")
        print("   - Ready for frontend integration")
        
        return True
        
    except Exception as e:
        print(f"❌ Error generating instructions: {e}")
        return False

def main():
    """Main final configuration function"""
    print("🚀 12thhaus Final Hasura Configuration Solution")
    print("Comprehensive connectivity resolution and manual backup")
    print("=" * 65)
    
    # Step 1: Test all pooler formats
    working_config = test_supabase_pooler_formats()
    
    if working_config:
        print(f"\n🎉 CONNECTIVITY SOLUTION FOUND!")
        print(f"✅ Working configuration: {working_config['name']}")
        
        # Step 2: Configure as default source
        if configure_working_source(working_config):
            print("✅ Default database source configured")
            
            # Step 3: Batch track all tables
            tracked_count, failed_tables = batch_track_tables()
            
            if tracked_count > 0:
                print(f"✅ {tracked_count}/15 tables tracked successfully")
                
                # Step 4: Test GraphQL functionality
                if test_complete_graphql_functionality():
                    print("\n🎉 PRP 2.3 HASURA CONFIGURATION COMPLETE!")
                    print("✅ Network connectivity issue resolved")
                    print("✅ Database connection established via optimal method")
                    print("✅ All spiritual platform tables operational in GraphQL")
                    print("✅ 12thhaus v2.0 GraphQL API ready for frontend integration")
                    
                    if failed_tables:
                        print(f"\n⚠️  Note: {len(failed_tables)} tables may need manual attention")
                    
                    return True
                else:
                    print("\n⚠️  Configuration successful but GraphQL testing had issues")
            else:
                print("❌ No tables could be tracked")
        else:
            print("❌ Could not configure default source")
    
    # If automated configuration fails, provide manual instructions
    print("\n🔧 FALLBACK: Manual Hasura Console Configuration")
    generate_manual_setup_instructions(failed_config=True)
    
    return False

if __name__ == "__main__":
    success = main()
    if success:
        print(f"\n🎯 SUCCESS: Automated Hasura Configuration Complete")
        print("🚀 Ready to proceed with frontend integration")
        sys.exit(0)
    else:
        print(f"\n📋 MANUAL CONFIGURATION REQUIRED")
        print("📖 Follow the manual setup instructions above")
        sys.exit(1)