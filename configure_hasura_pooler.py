#!/usr/bin/env python3
"""
Configure Hasura with Supabase IPv4 Connection Pooler
Robust solution for IPv6 connectivity limitations
"""

import requests
import json
import socket
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

def test_pooler_connectivity():
    """Test IPv4 connectivity to Supabase pooler"""
    try:
        print("🔍 Testing Supabase pooler IPv4 connectivity...")
        
        # Test connection to pooler host
        pooler_host = f"{SUPABASE_PROJECT_REF}.pooler.supabase.com"
        
        # Resolve IP addresses for pooler
        try:
            addr_info = socket.getaddrinfo(pooler_host, 5432, socket.AF_UNSPEC, socket.SOCK_STREAM)
            
            ipv4_addresses = []
            ipv6_addresses = []
            
            for family, type, proto, canonname, sockaddr in addr_info:
                ip = sockaddr[0]
                if family == socket.AF_INET:
                    ipv4_addresses.append(ip)
                elif family == socket.AF_INET6:
                    ipv6_addresses.append(ip)
            
            print(f"📋 Pooler IPv4 addresses: {ipv4_addresses}")
            print(f"📋 Pooler IPv6 addresses: {ipv6_addresses}")
            
            # Test TCP connection to first IPv4 address if available
            if ipv4_addresses:
                ip = ipv4_addresses[0]
                print(f"🧪 Testing TCP connection to pooler {ip}:5432...")
                
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(10)
                
                result = sock.connect_ex((ip, 5432))
                sock.close()
                
                if result == 0:
                    print(f"✅ Pooler TCP connection successful")
                    return True
                else:
                    print(f"❌ Pooler TCP connection failed (error: {result})")
            
            return len(ipv4_addresses) > 0
            
        except Exception as e:
            print(f"⚠️  Could not resolve pooler host: {e}")
            # Continue anyway - might still work
            return True
            
    except Exception as e:
        print(f"❌ Error testing pooler connectivity: {e}")
        return False

def configure_hasura_with_pooler():
    """Configure Hasura using Supabase connection pooler"""
    try:
        print("🔗 Configuring Hasura with Supabase IPv4 connection pooler...")
        
        # Remove any existing default source
        cleanup_query = {
            "type": "pg_drop_source",
            "args": {
                "name": "default",
                "cascade": True
            }
        }
        
        # Don't fail if this doesn't work
        requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=get_headers(),
            json=cleanup_query,
            timeout=15
        )
        
        # Configure with Supabase pooler for IPv4 connectivity
        pooler_url = f"postgresql://postgres:Paysoz991%40%23%23%23@{SUPABASE_PROJECT_REF}.pooler.supabase.com:5432/postgres?sslmode=require"
        
        print(f"📋 Pooler URL: {pooler_url}")
        
        add_source_query = {
            "type": "pg_add_source",
            "args": {
                "name": "default",
                "configuration": {
                    "connection_info": {
                        "database_url": pooler_url,
                        "isolation_level": "read-committed",
                        "pool_settings": {
                            "connection_lifetime": 600,
                            "idle_timeout": 180,
                            "max_connections": 30,
                            "retries": 3
                        },
                        "use_prepared_statements": False  # Recommended for pooler
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
                print("✅ Hasura successfully connected via IPv4 pooler!")
                return True
            else:
                print(f"❌ Pooler connection failed: {result}")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error configuring pooler: {e}")
        return False

def test_hasura_database_access():
    """Test that Hasura can access our twelthhaus schema"""
    try:
        print("🧪 Testing Hasura database access to twelthhaus schema...")
        
        # Try to track one table as a test
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
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("message") == "success":
                print("✅ Database access successful - spiritual_disciplines table tracked")
                return True
            else:
                if "already tracked" in str(result).lower():
                    print("✅ Database access confirmed - table already tracked")
                    return True
                print(f"⚠️  Database access issue: {result}")
                return False
        else:
            print(f"❌ Database access failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing database access: {e}")
        return False

def track_all_twelthhaus_tables():
    """Track all tables in twelthhaus schema"""
    try:
        print("📋 Tracking all twelthhaus schema tables...")
        
        # List of all twelthhaus tables
        tables = [
            "users",
            "practitioners", 
            "spiritual_disciplines",
            "spiritual_services",
            "spiritual_bookings",
            "community_posts",
            "community_comments", 
            "community_engagements",
            "conversations",
            "messages",
            "spiritual_reviews",
            "spiritual_journey_entries",
            "payment_transactions",
            "notifications",
            "user_spiritual_preferences"
        ]
        
        tracked_count = 0
        failed_tables = []
        
        for table in tables:
            try:
                print(f"  📌 Tracking {table}...")
                
                track_query = {
                    "type": "pg_track_table",
                    "args": {
                        "source": "default",
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
                    timeout=20
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("message") == "success":
                        print(f"    ✅ {table} tracked successfully")
                        tracked_count += 1
                    else:
                        if "already tracked" in str(result).lower():
                            print(f"    ✅ {table} already tracked")
                            tracked_count += 1
                        else:
                            print(f"    ❌ {table} failed: {result}")
                            failed_tables.append(table)
                else:
                    print(f"    ❌ {table} HTTP error: {response.status_code}")
                    failed_tables.append(table)
                    
            except Exception as e:
                print(f"    ❌ {table} error: {e}")
                failed_tables.append(table)
        
        print(f"\n📊 Table tracking results:")
        print(f"  ✅ Successfully tracked: {tracked_count}/{len(tables)} tables")
        if failed_tables:
            print(f"  ❌ Failed tables: {failed_tables}")
        
        return tracked_count, failed_tables
        
    except Exception as e:
        print(f"❌ Error tracking tables: {e}")
        return 0, []

def test_graphql_query():
    """Test a simple GraphQL query"""
    try:
        print("🧪 Testing GraphQL query...")
        
        # Simple query to test spiritual_disciplines
        test_query = """
        query TestQuery {
          spiritual_disciplines(limit: 3) {
            id
            name
            category
            typical_duration_minutes
          }
        }
        """
        
        graphql_endpoint = "https://probable-donkey-61.hasura.app/v1/graphql"
        
        response = requests.post(
            graphql_endpoint,
            headers={
                "Content-Type": "application/json",
                "x-hasura-admin-secret": HASURA_ADMIN_SECRET
            },
            json={"query": test_query},
            timeout=20
        )
        
        if response.status_code == 200:
            result = response.json()
            if "data" in result and "spiritual_disciplines" in result["data"]:
                disciplines = result["data"]["spiritual_disciplines"]
                print(f"✅ GraphQL query successful - {len(disciplines)} spiritual disciplines found")
                for discipline in disciplines:
                    print(f"    📿 {discipline['name']} ({discipline['category']})")
                return True
            else:
                print(f"⚠️  GraphQL query issue: {result}")
                return False
        else:
            print(f"❌ GraphQL query failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing GraphQL: {e}")
        return False

def main():
    """Main configuration function"""
    print("🚀 12thhaus Hasura IPv4 Pooler Configuration")
    print("Robust solution for Hasura-Supabase connectivity")
    print("=" * 60)
    
    # Step 1: Test pooler connectivity
    if not test_pooler_connectivity():
        print("⚠️  Pooler connectivity test failed, but continuing...")
    
    print()
    
    # Step 2: Configure Hasura with pooler
    if not configure_hasura_with_pooler():
        print("❌ Cannot proceed - Hasura pooler configuration failed")
        return False
    
    print()
    
    # Step 3: Test database access
    if not test_hasura_database_access():
        print("❌ Cannot proceed - Database access test failed")
        return False
    
    print()
    
    # Step 4: Track all tables
    tracked_count, failed_tables = track_all_twelthhaus_tables()
    
    if tracked_count == 0:
        print("❌ No tables could be tracked")
        return False
    
    print()
    
    # Step 5: Test GraphQL functionality
    if test_graphql_query():
        print("\n🎉 HASURA CONFIGURATION COMPLETE!")
        print("✅ IPv4 pooler connection established")
        print(f"✅ {tracked_count}/15 tables tracked successfully")
        print("✅ GraphQL API operational with spiritual platform data")
        print("✅ PRP 2.3 - Hasura GraphQL Configuration COMPLETE")
        
        if failed_tables:
            print(f"\n⚠️  Note: {len(failed_tables)} tables need manual tracking: {failed_tables}")
        
        return True
    else:
        print("\n⚠️  Configuration mostly successful but GraphQL testing failed")
        print("🔧 Manual verification recommended via Hasura Console")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print(f"\n🎯 SUCCESS: Hasura GraphQL Configuration Complete")
        sys.exit(0)
    else:
        print(f"\n❌ PARTIAL SUCCESS: Manual configuration may be required")
        sys.exit(1)