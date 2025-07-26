#!/usr/bin/env python3
"""
Check Hasura Cloud Configuration
Inspect current database sources and metadata
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

def get_hasura_metadata():
    """Get current Hasura metadata"""
    try:
        print("🔍 Inspecting current Hasura metadata...")
        
        query = {"type": "export_metadata", "args": {}}
        
        response = requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=get_headers(),
            json=query,
            timeout=30
        )
        
        if response.status_code == 200:
            metadata = response.json()
            
            # Check sources
            sources = metadata.get("sources", [])
            print(f"📊 Found {len(sources)} database sources:")
            
            for i, source in enumerate(sources):
                name = source.get("name", "Unknown")
                kind = source.get("kind", "Unknown")
                tables = source.get("tables", [])
                print(f"  {i+1}. {name} ({kind}) - {len(tables)} tables")
                
                # Show some table details
                if tables:
                    print(f"     Sample tables:")
                    for table in tables[:5]:
                        table_name = table.get("table", {})
                        if isinstance(table_name, dict):
                            schema = table_name.get("schema", "")
                            name = table_name.get("name", "")
                            print(f"       - {schema}.{name}")
                        else:
                            print(f"       - {table_name}")
                    if len(tables) > 5:
                        print(f"       ... and {len(tables) - 5} more")
                
            return metadata
            
        else:
            print(f"❌ Failed to get metadata: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error getting metadata: {e}")
        return None

def check_twelthhaus_schema():
    """Check if twelthhaus schema is accessible"""
    try:
        print("\n🔍 Checking for twelthhaus schema in existing sources...")
        
        # Get sources
        query = {"type": "get_source_kind_capabilities", "args": {"source": "default"}}
        
        response = requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=get_headers(),
            json=query,
            timeout=15
        )
        
        if response.status_code == 200:
            print("✅ Default source exists")
            return True
        else:
            print(f"⚠️  Default source check: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error checking source: {e}")
        return False

def get_available_schemas():
    """Get available schemas from the default source"""
    try:
        print("\n🔍 Getting available schemas...")
        
        # Try to get schema information
        query = {
            "type": "run_sql",
            "args": {
                "source": "default",
                "sql": "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast') ORDER BY schema_name;"
            }
        }
        
        response = requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=get_headers(),
            json=query,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            if "result" in result:
                schemas = result["result"]
                print(f"📊 Available schemas:")
                for i, row in enumerate(schemas[1:]):  # Skip header row
                    print(f"  {i+1}. {row[0]}")
                return schemas
            else:
                print(f"⚠️  SQL result: {result}")
                return None
        else:
            print(f"❌ Failed to get schemas: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error getting schemas: {e}")
        return None

def check_twelthhaus_tables():
    """Check if twelthhaus tables exist"""
    try:
        print("\n🔍 Checking for twelthhaus tables...")
        
        query = {
            "type": "run_sql",
            "args": {
                "source": "default",
                "sql": "SELECT table_name FROM information_schema.tables WHERE table_schema = 'twelthhaus' ORDER BY table_name;"
            }
        }
        
        response = requests.post(
            HASURA_METADATA_ENDPOINT,
            headers=get_headers(),
            json=query,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            if "result" in result and len(result["result"]) > 1:
                tables = result["result"]
                print(f"📊 Found {len(tables)-1} tables in twelthhaus schema:")
                for i, row in enumerate(tables[1:]):  # Skip header row
                    print(f"  {i+1}. {row[0]}")
                return tables
            else:
                print("⚠️  No tables found in twelthhaus schema")
                return None
        else:
            print(f"❌ Failed to check tables: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error checking tables: {e}")
        return None

def main():
    """Main inspection function"""
    print("🚀 12thhaus Hasura Cloud Inspection")
    print("Checking current configuration and database connectivity")
    print("=" * 60)
    
    # Get current metadata
    metadata = get_hasura_metadata()
    
    # Check default source
    check_twelthhaus_schema()
    
    # Get available schemas
    schemas = get_available_schemas()
    
    # Check twelthhaus tables
    tables = check_twelthhaus_tables()
    
    print("\n📋 Inspection Summary")
    print("=" * 30)
    
    if metadata:
        sources = metadata.get("sources", [])
        print(f"✅ Hasura metadata accessible - {len(sources)} sources")
    else:
        print("❌ Cannot access Hasura metadata")
    
    if schemas:
        print(f"✅ Database schemas accessible - {len(schemas)-1} schemas found")
    else:
        print("❌ Cannot access database schemas")
    
    if tables:
        print(f"✅ Twelthhaus tables found - {len(tables)-1} tables")
        print("🎯 Ready to track tables in Hasura")
    else:
        print("❌ Twelthhaus tables not accessible")
    
    return bool(metadata and schemas and tables)

if __name__ == "__main__":
    main()