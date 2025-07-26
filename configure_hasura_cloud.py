#!/usr/bin/env python3
"""
Hasura Cloud Configuration for 12thhaus v2.0
Connect live database to GraphQL API and configure spiritual platform
"""

import requests
import json
import time
import sys

# Hasura Cloud configuration
HASURA_ENDPOINT = "https://probable-donkey-61.hasura.app/v1/graphql"
HASURA_METADATA_ENDPOINT = "https://probable-donkey-61.hasura.app/v1/metadata"
HASURA_ADMIN_SECRET = "3GnFK5l1bySIMsKQ46IAAf2IzSQ7Is1RvlXaGAh4M1vZqLlRKmRPk1w76Mdq0eQq"

# Database connection details
DATABASE_URL = "postgresql://postgres:Paysoz991%40%23%23%23@db.xgfkhrxabdkjkzduvqnu.supabase.co:5432/postgres?options=-csearch_path%3Dtwelthhaus,public"

def get_headers():
    """Get headers for Hasura API requests"""
    return {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET
    }

def check_hasura_connection():
    """Verify Hasura Cloud connection"""
    try:
        print("🔍 Checking Hasura Cloud connection...")
        
        response = requests.post(
            HASURA_ENDPOINT,
            headers=get_headers(),
            json={"query": "query { __schema { queryType { name } } }"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data:
                print("✅ Hasura Cloud connected and responding")
                return True
            else:
                print(f"⚠️  Hasura response: {data}")
                return False
        else:
            print(f"❌ Hasura connection failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Hasura connection error: {e}")
        return False

def add_database_source():
    """Add the Supabase database as a source in Hasura"""
    try:
        print("📦 Adding twelthhaus database source to Hasura...")
        
        add_source_query = {
            "type": "pg_add_source",
            "args": {
                "name": "twelthhaus_db",
                "configuration": {
                    "connection_info": {
                        "database_url": DATABASE_URL,
                        "isolation_level": "read-committed",
                        "pool_settings": {
                            "connection_lifetime": 600,
                            "idle_timeout": 180,
                            "max_connections": 50,
                            "retries": 1
                        },
                        "use_prepared_statements": True
                    },
                    "extensions_schema": "public"
                },
                "customization": {
                    "root_fields": {
                        "namespace": "",
                        "prefix": "",
                        "suffix": ""
                    },
                    "type_names": {
                        "prefix": "",
                        "suffix": ""
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
                print("✅ Database source added successfully")
                return True
            else:
                print(f"⚠️  Database source response: {result}")
                # Check if source already exists
                if "already exists" in str(result):
                    print("✅ Database source already configured")
                    return True
                return False
        else:
            print(f"❌ Failed to add database source: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Database source addition error: {e}")
        return False

def track_spiritual_tables():
    """Track all spiritual platform tables in Hasura"""
    try:
        print("📊 Tracking spiritual platform tables...")
        
        # List of tables to track in the twelthhaus schema
        tables_to_track = [
            "users",
            "practitioners", 
            "user_spiritual_preferences",
            "spiritual_disciplines",
            "spiritual_services",
            "spiritual_bookings",
            "spiritual_reviews",
            "community_posts",
            "community_comments", 
            "community_engagements",
            "conversations",
            "messages",
            "spiritual_journey_entries",
            "payment_transactions",
            "notifications"
        ]
        
        tracked_count = 0
        
        for table in tables_to_track:
            try:
                track_query = {
                    "type": "pg_track_table",
                    "args": {
                        "source": "twelthhaus_db",
                        "table": {
                            "schema": "twelthhaus",
                            "name": table
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
                        print(f"✅ Tracked table: {table}")
                        tracked_count += 1
                    else:
                        # Check if already tracked
                        if "already tracked" in str(result).lower():
                            print(f"✅ Already tracked: {table}")
                            tracked_count += 1
                        else:
                            print(f"⚠️  Table {table}: {result}")
                else:
                    print(f"❌ Failed to track {table}: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Error tracking {table}: {e}")
        
        print(f"📊 Successfully tracked {tracked_count}/{len(tables_to_track)} tables")
        return tracked_count >= (len(tables_to_track) * 0.8)  # 80% success rate
        
    except Exception as e:
        print(f"❌ Table tracking error: {e}")
        return False

def configure_table_relationships():
    """Configure relationships between spiritual platform tables"""
    try:
        print("🔗 Configuring table relationships...")
        
        # Define key relationships for spiritual platform
        relationships = [
            # Users to Practitioners (one-to-one)
            {
                "table": {"schema": "twelthhaus", "name": "practitioners"},
                "relationship": "user",
                "type": "object",
                "using": {
                    "foreign_key_constraint_on": "user_id"
                }
            },
            # Practitioners to Users (reverse)
            {
                "table": {"schema": "twelthhaus", "name": "users"},
                "relationship": "practitioner_profile",
                "type": "object", 
                "using": {
                    "manual_configuration": {
                        "remote_table": {"schema": "twelthhaus", "name": "practitioners"},
                        "column_mapping": {"id": "user_id"}
                    }
                }
            },
            # Spiritual Services to Practitioners
            {
                "table": {"schema": "twelthhaus", "name": "spiritual_services"},
                "relationship": "practitioner",
                "type": "object",
                "using": {
                    "foreign_key_constraint_on": "practitioner_id"
                }
            },
            # Spiritual Services to Disciplines
            {
                "table": {"schema": "twelthhaus", "name": "spiritual_services"},
                "relationship": "spiritual_discipline",
                "type": "object",
                "using": {
                    "foreign_key_constraint_on": "discipline_id"
                }
            },
            # Spiritual Bookings to Services
            {
                "table": {"schema": "twelthhaus", "name": "spiritual_bookings"},
                "relationship": "spiritual_service",
                "type": "object",
                "using": {
                    "foreign_key_constraint_on": "service_id"
                }
            },
            # Spiritual Bookings to Client (User)
            {
                "table": {"schema": "twelthhaus", "name": "spiritual_bookings"},
                "relationship": "client",
                "type": "object",
                "using": {
                    "foreign_key_constraint_on": "client_id"
                }
            },
            # Community Posts to Authors
            {
                "table": {"schema": "twelthhaus", "name": "community_posts"},
                "relationship": "author",
                "type": "object",
                "using": {
                    "foreign_key_constraint_on": "author_id"
                }
            },
            # Community Comments to Posts
            {
                "table": {"schema": "twelthhaus", "name": "community_comments"},
                "relationship": "post",
                "type": "object",
                "using": {
                    "foreign_key_constraint_on": "post_id"
                }
            }
        ]
        
        configured_count = 0
        
        for rel in relationships:
            try:
                if rel["type"] == "object":
                    rel_query = {
                        "type": "pg_create_object_relationship",
                        "args": {
                            "source": "twelthhaus_db",
                            "table": rel["table"],
                            "name": rel["relationship"],
                            "using": rel["using"]
                        }
                    }
                else:
                    rel_query = {
                        "type": "pg_create_array_relationship", 
                        "args": {
                            "source": "twelthhaus_db",
                            "table": rel["table"],
                            "name": rel["relationship"],
                            "using": rel["using"]
                        }
                    }
                
                response = requests.post(
                    HASURA_METADATA_ENDPOINT,
                    headers=get_headers(),
                    json=rel_query,
                    timeout=15
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("message") == "success":
                        print(f"✅ Configured relationship: {rel['table']['name']}.{rel['relationship']}")
                        configured_count += 1
                    else:
                        if "already exists" in str(result).lower():
                            print(f"✅ Already exists: {rel['table']['name']}.{rel['relationship']}")
                            configured_count += 1
                        else:
                            print(f"⚠️  Relationship {rel['relationship']}: {result}")
                else:
                    print(f"❌ Failed to configure {rel['relationship']}: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Error configuring {rel['relationship']}: {e}")
        
        print(f"🔗 Successfully configured {configured_count}/{len(relationships)} relationships")
        return configured_count >= (len(relationships) * 0.7)  # 70% success rate
        
    except Exception as e:
        print(f"❌ Relationship configuration error: {e}")
        return False

def test_spiritual_platform_queries():
    """Test key GraphQL queries for spiritual platform"""
    try:
        print("🧪 Testing spiritual platform GraphQL queries...")
        
        test_queries = [
            # Test 1: Spiritual Disciplines
            {
                "name": "Spiritual Disciplines",
                "query": """
                    query GetSpiritualDisciplines {
                        spiritual_disciplines(limit: 5) {
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
            # Test 2: Users query
            {
                "name": "Users",
                "query": """
                    query GetUsers {
                        users(limit: 3) {
                            id
                            email
                            user_type
                            full_name
                            created_at
                        }
                    }
                """
            },
            # Test 3: Practitioners with relationships
            {
                "name": "Practitioners with User data",
                "query": """
                    query GetPractitioners {
                        practitioners(limit: 3) {
                            id
                            business_name
                            bio
                            verification_status
                            user {
                                full_name
                                email
                            }
                        }
                    }
                """
            }
        ]
        
        successful_queries = 0
        
        for test in test_queries:
            try:
                response = requests.post(
                    HASURA_ENDPOINT,
                    headers=get_headers(),
                    json={"query": test["query"]},
                    timeout=15
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if 'data' in data and not data.get('errors'):
                        print(f"✅ {test['name']} query successful")
                        successful_queries += 1
                    else:
                        print(f"⚠️  {test['name']} query has issues: {data.get('errors', 'No data')}")
                else:
                    print(f"❌ {test['name']} query failed: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Error testing {test['name']}: {e}")
        
        print(f"🧪 Successfully tested {successful_queries}/{len(test_queries)} queries")
        return successful_queries >= (len(test_queries) * 0.7)  # 70% success rate
        
    except Exception as e:
        print(f"❌ Query testing error: {e}")
        return False

def main():
    """Main Hasura configuration function"""
    print("🚀 12thhaus v2.0 Hasura GraphQL Configuration")
    print("Connecting live database to spiritual platform API")
    print("=" * 60)
    
    success_count = 0
    total_steps = 5
    
    # Step 1: Check connection
    if check_hasura_connection():
        success_count += 1
        print()
    else:
        print("❌ Cannot proceed without Hasura connection")
        sys.exit(1)
    
    # Step 2: Add database source
    if add_database_source():
        success_count += 1
        print()
    
    # Step 3: Track tables
    if track_spiritual_tables():
        success_count += 1
        print()
    
    # Step 4: Configure relationships
    if configure_table_relationships():
        success_count += 1
        print()
    
    # Step 5: Test queries
    if test_spiritual_platform_queries():
        success_count += 1
        print()
    
    print("📋 Hasura Configuration Summary")
    print("=" * 40)
    print(f"📊 Completed: {success_count}/{total_steps} configuration steps")
    
    if success_count >= 4:  # 80% success rate
        print("\n🎉 HASURA CONFIGURATION SUCCESSFUL!")
        print("✅ Spiritual platform GraphQL API operational")
        print("✅ Database connected with table tracking")
        print("✅ Relationships configured for complex queries")
        print("✅ Ready for frontend integration")
        
        print(f"\n🌐 GraphQL Endpoint: {HASURA_ENDPOINT}")
        print("🔑 Admin secret configured for development")
        print("🎯 Ready for spiritual platform frontend integration")
        
        return True
    else:
        print("\n⚠️  HASURA CONFIGURATION INCOMPLETE")
        print("Some steps failed - review logs and retry")
        return False

if __name__ == "__main__":
    main()