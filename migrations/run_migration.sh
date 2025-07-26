#!/bin/bash

# =====================================================
# Migration Runner Script
# Usage: ./run_migration.sh [apply|rollback] [migration_version] [environment]
# =====================================================

set -e  # Exit on any error

# Default values
ACTION="${1:-apply}"
MIGRATION_VERSION="${2}"
ENVIRONMENT="${3:-development}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$MIGRATIONS_DIR")"

# Environment-specific database URLs
case $ENVIRONMENT in
    "development")
        DB_URL="${DATABASE_URL:-postgresql://localhost:5432/langgraph_dev}"
        ;;
    "staging")
        DB_URL="${STAGING_DATABASE_URL:-postgresql://localhost:5432/langgraph_staging}"
        ;;
    "production")
        DB_URL="${PRODUCTION_DATABASE_URL}"
        if [ -z "$DB_URL" ]; then
            echo -e "${RED}❌ PRODUCTION_DATABASE_URL not set${NC}"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
        echo -e "${YELLOW}Valid environments: development, staging, production${NC}"
        exit 1
        ;;
esac

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql not found. Please install PostgreSQL client.${NC}"
    exit 1
fi

# Function to print usage
print_usage() {
    echo -e "${BLUE}Migration Runner for 12thhaus Spiritual Platform${NC}"
    echo ""
    echo "Usage: $0 [ACTION] [VERSION] [ENVIRONMENT]"
    echo ""
    echo "Actions:"
    echo "  apply     - Apply forward migration (default)"
    echo "  rollback  - Apply rollback migration"
    echo "  status    - Show migration status"
    echo "  validate  - Validate schema integrity"
    echo "  backup    - Create schema backup"
    echo "  list      - List available migrations"
    echo ""
    echo "Examples:"
    echo "  $0 apply 001 development"
    echo "  $0 rollback 001 development" 
    echo "  $0 status development"
    echo "  $0 validate production"
    echo ""
}

# Function to execute SQL file
execute_sql_file() {
    local sql_file="$1"
    local description="$2"
    
    echo -e "${BLUE}📂 Executing: $description${NC}"
    echo -e "${YELLOW}   File: $sql_file${NC}"
    echo -e "${YELLOW}   Environment: $ENVIRONMENT${NC}"
    echo -e "${YELLOW}   Database: $DB_URL${NC}"
    echo ""
    
    # Confirm execution for production
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${RED}⚠️  WARNING: You are about to execute a migration on PRODUCTION!${NC}"
        read -p "Type 'CONFIRM' to proceed: " confirmation
        if [ "$confirmation" != "CONFIRM" ]; then
            echo -e "${YELLOW}❌ Migration cancelled${NC}"
            exit 1
        fi
    fi
    
    # Record start time
    start_time=$(date +%s)
    
    # Execute the SQL file
    if psql "$DB_URL" -f "$sql_file" -v ON_ERROR_STOP=1; then
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        echo -e "${GREEN}✅ Migration completed successfully in ${duration}s${NC}"
        return 0
    else
        echo -e "${RED}❌ Migration failed${NC}"
        return 1
    fi
}

# Function to check migration status
check_status() {
    echo -e "${BLUE}📊 Migration Status for $ENVIRONMENT${NC}"
    echo ""
    
    psql "$DB_URL" -c "
    SELECT 
        version,
        description,
        status,
        applied_at,
        applied_by
    FROM schema_migrations 
    ORDER BY version;
    " 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Migration system not initialized${NC}"
        echo -e "${BLUE}💡 Run: $0 init $ENVIRONMENT${NC}"
        return 1
    }
}

# Function to validate schema
validate_schema() {
    echo -e "${BLUE}🔍 Validating Schema Integrity${NC}"
    echo ""
    
    psql "$DB_URL" -c "SELECT * FROM validate_schema_integrity();" || {
        echo -e "${RED}❌ Schema validation failed${NC}"
        return 1
    }
}

# Function to create backup
create_backup() {
    local backup_name="${1:-manual_backup}"
    echo -e "${BLUE}💾 Creating Schema Backup: $backup_name${NC}"
    
    psql "$DB_URL" -c "SELECT create_schema_backup('$backup_name');" || {
        echo -e "${RED}❌ Backup creation failed${NC}"
        return 1
    }
}

# Function to list migrations
list_migrations() {
    echo -e "${BLUE}📋 Available Migrations${NC}"
    echo ""
    
    echo -e "${YELLOW}Forward Migrations:${NC}"
    for file in "$MIGRATIONS_DIR"/*.sql; do
        if [[ $(basename "$file") =~ ^[0-9]{3}_.*\.sql$ ]] && [[ ! $(basename "$file") =~ rollback ]]; then
            echo "  $(basename "$file")"
        fi
    done
    
    echo ""
    echo -e "${YELLOW}Rollback Migrations:${NC}"
    for file in "$MIGRATIONS_DIR"/*rollback*.sql; do
        if [ -f "$file" ]; then
            echo "  $(basename "$file")"
        fi
    done
}

# Function to initialize migration system
init_migration_system() {
    echo -e "${BLUE}🚀 Initializing Migration System${NC}"
    
    if execute_sql_file "$MIGRATIONS_DIR/migration_manager.sql" "Migration Manager Setup"; then
        echo -e "${GREEN}✅ Migration system initialized${NC}"
    else
        echo -e "${RED}❌ Failed to initialize migration system${NC}"
        exit 1
    fi
}

# Main execution logic
case $ACTION in
    "apply")
        if [ -z "$MIGRATION_VERSION" ]; then
            echo -e "${RED}❌ Migration version required for apply action${NC}"
            print_usage
            exit 1
        fi
        
        migration_file="$MIGRATIONS_DIR/${MIGRATION_VERSION}_*.sql"
        # Find the migration file (exclude rollback files)
        migration_file=$(find "$MIGRATIONS_DIR" -name "${MIGRATION_VERSION}_*.sql" ! -name "*rollback*" | head -1)
        
        if [ ! -f "$migration_file" ]; then
            echo -e "${RED}❌ Migration file not found: ${MIGRATION_VERSION}_*.sql${NC}"
            exit 1
        fi
        
        execute_sql_file "$migration_file" "Forward Migration $MIGRATION_VERSION"
        ;;
        
    "rollback")
        if [ -z "$MIGRATION_VERSION" ]; then
            echo -e "${RED}❌ Migration version required for rollback action${NC}"
            print_usage
            exit 1
        fi
        
        rollback_file=$(find "$MIGRATIONS_DIR" -name "${MIGRATION_VERSION}_*rollback*.sql" | head -1)
        
        if [ ! -f "$rollback_file" ]; then
            echo -e "${RED}❌ Rollback file not found: ${MIGRATION_VERSION}_*rollback*.sql${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}⚠️  WARNING: Rollback operations may result in data loss!${NC}"
        read -p "Are you sure you want to proceed? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            execute_sql_file "$rollback_file" "Rollback Migration $MIGRATION_VERSION"
        else
            echo -e "${YELLOW}❌ Rollback cancelled${NC}"
        fi
        ;;
        
    "status")
        check_status
        ;;
        
    "validate")
        validate_schema
        ;;
        
    "backup")
        backup_name="${MIGRATION_VERSION:-manual_backup}"
        create_backup "$backup_name"
        ;;
        
    "list")
        list_migrations
        ;;
        
    "init")
        init_migration_system
        ;;
        
    "help"|"-h"|"--help")
        print_usage
        ;;
        
    *)
        echo -e "${RED}❌ Invalid action: $ACTION${NC}"
        print_usage
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Operation completed successfully!${NC}"