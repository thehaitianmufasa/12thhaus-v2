#!/usr/bin/env python3
"""
Resolve Hasura-Supabase Network Connectivity Issue
Comprehensive IPv4/IPv6 and firewall resolution
"""

import requests
import json
import socket
import sys
import time

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

def resolve_supabase_ips():
    """Resolve both IPv4 and IPv6 addresses for Supabase host"""
    try:
        print("🔍 Resolving Supabase database host IP addresses...")
        
        host = f"db.{SUPABASE_PROJECT_REF}.supabase.co"
        
        # Get all IP addresses (both IPv4 and IPv6)
        addr_info = socket.getaddrinfo(host, 5432, socket.AF_UNSPEC, socket.SOCK_STREAM)
        
        ipv4_addresses = []
        ipv6_addresses = []
        
        for family, type, proto, canonname, sockaddr in addr_info:
            ip = sockaddr[0]
            if family == socket.AF_INET:
                ipv4_addresses.append(ip)
            elif family == socket.AF_INET6:
                ipv6_addresses.append(ip)
        
        print(f"📋 IPv4 addresses: {ipv4_addresses}")
        print(f"📋 IPv6 addresses: {ipv6_addresses}")
        
        return ipv4_addresses, ipv6_addresses
        
    except Exception as e:
        print(f"❌ Error resolving IPs: {e}")
        return [], []

def test_direct_ip_connection(ip_address, port=5432):
    """Test direct TCP connection to IP address"""
    try:
        print(f"🔍 Testing direct TCP connection to {ip_address}:{port}...")
        
        # Try to establish TCP connection
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        
        result = sock.connect_ex((ip_address, port))
        sock.close()
        
        if result == 0:
            print(f"✅ TCP connection successful to {ip_address}:{port}")
            return True
        else:
            print(f"❌ TCP connection failed to {ip_address}:{port} (error: {result})")
            return False
            
    except Exception as e:
        print(f"❌ Connection test error: {e}")
        return False

def test_hasura_with_explicit_ip(ip_address):
    """Test Hasura connection using explicit IP address"""
    try:
        print(f"🔍 Testing Hasura connection with explicit IP: {ip_address}")
        
        # Connection string with explicit IP
        ip_connection_url = f"postgresql://postgres:Paysoz991%40%23%23%23@{ip_address}:5432/postgres?sslmode=require&connect_timeout=30"
        
        add_source_query = {
            "type": "pg_add_source",
            "args": {
                "name": f"test_ip_{ip_address.replace('.', '_')}",
                "configuration": {
                    "connection_info": {
                        "database_url": ip_connection_url,
                        "isolation_level": "read-committed",
                        "pool_settings": {
                            "connection_lifetime": 600,
                            "idle_timeout": 180,
                            "max_connections": 20,
                            "retries": 3
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
            timeout=45
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("message") == "success":
                print(f"✅ SUCCESS: IP connection works with {ip_address}")
                
                # Clean up test source
                cleanup_query = {
                    "type": "pg_drop_source",
                    "args": {
                        "name": f"test_ip_{ip_address.replace('.', '_')}",
                        "cascade": True
                    }
                }
                
                requests.post(
                    HASURA_METADATA_ENDPOINT,
                    headers=get_headers(),
                    json=cleanup_query,
                    timeout=15
                )
                
                return ip_connection_url
            else:
                print(f"❌ IP connection failed: {result}")
                return None
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error testing IP connection: {e}")
        return None

def test_hasura_with_alternative_ports():
    """Test alternative Supabase connection ports"""
    try:
        print("🔍 Testing alternative Supabase connection ports...")
        
        host = f"db.{SUPABASE_PROJECT_REF}.supabase.co"
        
        # Alternative connection configurations
        test_configs = [
            {
                "name": "Standard SSL with keepalive",
                "url": f"postgresql://postgres:Paysoz991%40%23%23%23@{host}:5432/postgres?sslmode=require&keepalives_idle=30&keepalives_interval=10&keepalives_count=3"
            },
            {
                "name": "Connection pooler port",
                "url": f"postgresql://postgres:Paysoz991%40%23%23%23@{host}:6543/postgres?sslmode=require&application_name=hasura"
            },
            {
                "name": "Alternative SSL configuration",
                "url": f"postgresql://postgres:Paysoz991%40%23%23%23@{host}:5432/postgres?sslmode=prefer&connect_timeout=60"
            }
        ]
        
        for i, config in enumerate(test_configs):
            print(f"\n🧪 Testing {config['name']}...")
            
            add_source_query = {
                "type": "pg_add_source",
                "args": {
                    "name": f"test_alt_{i+1}",
                    "configuration": {
                        "connection_info": {
                            "database_url": config["url"],
                            "isolation_level": "read-committed",
                            "pool_settings": {
                                "connection_lifetime": 300,
                                "idle_timeout": 60,
                                "max_connections": 10,
                                "retries": 2
                            },
                            "use_prepared_statements": False  # Disable for compatibility
                        }
                    }
                }
            }
            
            try:
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
                        cleanup_query = {
                            "type": "pg_drop_source",
                            "args": {
                                "name": f"test_alt_{i+1}",
                                "cascade": True
                            }
                        }
                        
                        requests.post(
                            HASURA_METADATA_ENDPOINT,
                            headers=get_headers(),
                            json=cleanup_query,
                            timeout=15
                        )
                        
                        return config["url"]
                    else:
                        print(f"❌ Failed: {result}")
                else:
                    print(f"❌ HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                print(f"❌ Error testing {config['name']}: {e}")
        
        return None
        
    except Exception as e:
        print(f"❌ Error testing alternative ports: {e}")
        return None

def check_hasura_network_restrictions():
    """Check if Hasura Cloud has network restrictions"""
    try:
        print("🔍 Checking Hasura Cloud network configuration...")
        
        # Test basic Hasura Cloud connectivity
        response = requests.get(
            "https://probable-donkey-61.hasura.app/healthz",
            timeout=15
        )
        
        if response.status_code == 200:
            print("✅ Hasura Cloud is accessible")
            
            # Get Hasura Cloud metadata to check capabilities
            metadata_query = {
                "type": "export_metadata",
                "args": {}
            }
            
            response = requests.post(
                HASURA_METADATA_ENDPOINT,
                headers=get_headers(),
                json=metadata_query,
                timeout=30
            )
            
            if response.status_code == 200:
                metadata = response.json()
                print("✅ Hasura metadata accessible")
                
                # Check if any sources exist
                sources = metadata.get("sources", [])
                print(f"📋 Existing sources: {len(sources)}")
                
                return True
            else:
                print(f"❌ Metadata access failed: {response.status_code}")
                return False
        else:
            print(f"❌ Hasura Cloud not accessible: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error checking Hasura Cloud: {e}")
        return False

def configure_working_source(working_url):
    """Configure the working database source as default"""
    try:
        print(f"\n🔗 Configuring working database source as 'default'...")
        
        # First, try to remove existing default source if it exists
        cleanup_query = {
            "type": "pg_drop_source",
            "args": {
                "name": "default",
                "cascade": True
            }
        }
        
        # Don't fail if this doesn't work (source might not exist)
        requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=get_headers(),
            json=cleanup_query,
            timeout=15
        )
        
        # Add the working source as default
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
                            "retries": 3
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
                print("✅ Default database source configured successfully")
                return True
            else:
                print(f"⚠️  Configuration result: {result}")
                return False
        else:
            print(f"❌ Failed to configure source: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error configuring source: {e}")
        return False

def main():
    """Main network issue resolution function"""
    print("🚀 12thhaus Hasura Network Issue Resolution")
    print("Comprehensive IPv4/IPv6 and connectivity troubleshooting")
    print("=" * 70)
    
    # Step 1: Verify Hasura Cloud is accessible
    if not check_hasura_network_restrictions():
        print("❌ Cannot proceed - Hasura Cloud not accessible")
        return False
    
    print()
    
    # Step 2: Resolve Supabase IP addresses
    ipv4_addresses, ipv6_addresses = resolve_supabase_ips()
    
    if not ipv4_addresses:
        print("❌ No IPv4 addresses found for Supabase host")
        return False
    
    print()
    
    # Step 3: Test direct TCP connections to IPv4 addresses
    working_ips = []
    for ip in ipv4_addresses:
        if test_direct_ip_connection(ip):
            working_ips.append(ip)
    
    if not working_ips:
        print("❌ No working IP addresses found")
        return False
    
    print()
    
    # Step 4: Test Hasura connection with explicit IPv4 addresses
    for ip in working_ips:
        working_url = test_hasura_with_explicit_ip(ip)
        if working_url:
            print(f"\n🎉 SOLUTION FOUND: Explicit IPv4 connection works!")
            print(f"✅ Working IP: {ip}")
            print(f"✅ Working URL: {working_url}")
            
            # Configure as default source
            if configure_working_source(working_url):
                print("\n🎉 HASURA DATABASE CONNECTION RESOLVED!")
                print("✅ Network connectivity issue fixed")
                print("✅ Database source configured as 'default'")
                print("✅ Ready to proceed with table tracking")
                return working_url
            
    print()
    
    # Step 5: Test alternative connection configurations
    print("🔍 Testing alternative connection configurations...")
    working_url = test_hasura_with_alternative_ports()
    
    if working_url:
        print(f"\n🎉 ALTERNATIVE SOLUTION FOUND!")
        print(f"✅ Working URL: {working_url}")
        
        if configure_working_source(working_url):
            print("\n🎉 HASURA DATABASE CONNECTION RESOLVED!")
            print("✅ Alternative connection method successful")
            print("✅ Database source configured as 'default'")
            print("✅ Ready to proceed with table tracking")
            return working_url
    
    # If all methods fail
    print("\n❌ NETWORK CONNECTIVITY ISSUE PERSISTS")
    print("📋 This appears to be a Hasura Cloud regional or firewall limitation")
    print("📞 Recommended actions:")
    print("   1. Contact Hasura Cloud support about IPv6 connectivity issues")
    print("   2. Check if Supabase allows connections from Hasura Cloud region")
    print("   3. Consider using local Hasura instance for development")
    print("   4. Manual Hasura Console configuration may still work")
    
    return None

if __name__ == "__main__":
    working_url = main()
    if working_url:
        print(f"\n🎯 SUCCESS: Database connection resolved")
        print(f"🔗 Working URL: {working_url}")
        sys.exit(0)
    else:
        print(f"\n❌ FAILED: Network connectivity issue unresolved")
        sys.exit(1)