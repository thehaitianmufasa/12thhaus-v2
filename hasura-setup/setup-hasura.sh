#!/bin/bash

# =====================================================
# Hasura Setup Script for 12thhaus Spiritual Platform
# Automates Hasura connection to Supabase
# =====================================================

set -e  # Exit on any error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HASURA_VERSION="v2.33.4"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        log_error "curl is not installed. Please install curl first."
        exit 1
    fi
    
    log_success "All prerequisites are installed"
}

# Setup environment variables
setup_environment() {
    log_info "Setting up environment variables..."
    
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        if [ -f "$SCRIPT_DIR/.env.example" ]; then
            cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
            log_warning "Created .env file from .env.example"
            log_warning "Please update the .env file with your actual Supabase credentials"
            
            # Prompt user for essential variables
            read -p "Enter your Supabase project URL: " supabase_url
            read -p "Enter your Supabase database password: " supabase_password
            read -s -p "Enter a strong Hasura admin secret: " hasura_admin_secret
            echo
            
            # Update .env file
            sed -i.bak "s|https://your-project-ref.supabase.co|$supabase_url|g" "$SCRIPT_DIR/.env"
            sed -i.bak "s|your-supabase-password|$supabase_password|g" "$SCRIPT_DIR/.env"
            sed -i.bak "s|your-super-secret-admin-key|$hasura_admin_secret|g" "$SCRIPT_DIR/.env"
            
            # Generate JWT secret
            jwt_secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || openssl rand -hex 32)
            sed -i.bak "s|your-256-bit-jwt-secret-key-here|$jwt_secret|g" "$SCRIPT_DIR/.env"
            
            rm "$SCRIPT_DIR/.env.bak"
            log_success "Environment variables configured"
        else
            log_error ".env.example file not found"
            exit 1
        fi
    else
        log_success "Environment file already exists"
    fi
}

# Download Supabase SSL certificate
download_ssl_cert() {
    log_info "Setting up SSL certificates..."
    
    mkdir -p "$PROJECT_ROOT/certs"
    
    # Download Supabase CA certificate
    if [ ! -f "$PROJECT_ROOT/certs/supabase-ca-certificate.crt" ]; then
        curl -o "$PROJECT_ROOT/certs/supabase-ca-certificate.crt" \
            https://supabase.com/docs/ca-certificate.crt 2>/dev/null || {
            log_warning "Could not download Supabase CA certificate automatically"
            log_info "Please download it manually from: https://supabase.com/docs/ca-certificate.crt"
            log_info "Save it to: $PROJECT_ROOT/certs/supabase-ca-certificate.crt"
        }
    fi
    
    log_success "SSL certificates configured"
}

# Install Hasura CLI
install_hasura_cli() {
    log_info "Installing Hasura CLI..."
    
    if command -v hasura &> /dev/null; then
        local current_version=$(hasura version --skip-update-check | grep cli | awk '{print $2}')
        log_success "Hasura CLI already installed (version: $current_version)"
        return
    fi
    
    # Install Hasura CLI
    curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
    
    if command -v hasura &> /dev/null; then
        log_success "Hasura CLI installed successfully"
    else
        log_warning "Hasura CLI installation may have failed. Please install manually."
    fi
}

# Initialize Hasura project
initialize_hasura() {
    log_info "Initializing Hasura project..."
    
    cd "$PROJECT_ROOT"
    
    # Initialize Hasura if not already done
    if [ ! -f "$PROJECT_ROOT/hasura-metadata/version.yaml" ]; then
        if command -v hasura &> /dev/null; then
            hasura init hasura-temp --endpoint http://localhost:8080 --admin-secret "${HASURA_GRAPHQL_ADMIN_SECRET:-admin-secret}"
            
            # Move metadata to correct location
            if [ -d "hasura-temp" ]; then
                cp -r hasura-temp/metadata/* hasura-metadata/ 2>/dev/null || true
                cp hasura-temp/config.yaml . 2>/dev/null || true
                rm -rf hasura-temp
            fi
        fi
        
        # Create basic metadata structure
        mkdir -p hasura-metadata/{databases,actions,cron_triggers,remote_schemas}
        
        echo "version: 3" > hasura-metadata/version.yaml
        
        log_success "Hasura project initialized"
    else
        log_success "Hasura project already initialized"
    fi
}

# Start Hasura services
start_services() {
    log_info "Starting Hasura services..."
    
    cd "$SCRIPT_DIR"
    
    # Load environment variables
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Start services with Docker Compose
    docker-compose up -d
    
    # Wait for services to be ready
    log_info "Waiting for Hasura to be ready..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8080/healthz > /dev/null 2>&1; then
            log_success "Hasura is ready!"
            break
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "Hasura failed to start within the expected time"
        log_info "Check logs with: docker-compose logs hasura"
        exit 1
    fi
}

# Apply metadata and migrations
apply_metadata() {
    log_info "Applying Hasura metadata..."
    
    cd "$PROJECT_ROOT"
    
    if command -v hasura &> /dev/null; then
        # Set endpoint and admin secret
        export HASURA_GRAPHQL_ENDPOINT="http://localhost:8080"
        export HASURA_GRAPHQL_ADMIN_SECRET="${HASURA_GRAPHQL_ADMIN_SECRET:-admin-secret}"
        
        # Apply metadata
        hasura metadata apply --skip-update-check || {
            log_warning "Could not apply metadata automatically"
            log_info "You can apply it manually from the Hasura console"
        }
        
        # Apply migrations if they exist
        if [ -d "migrations" ]; then
            hasura migrate apply --skip-update-check || {
                log_warning "Could not apply migrations automatically"
            }
        fi
        
        log_success "Metadata and migrations applied"
    else
        log_warning "Hasura CLI not available. Please apply metadata manually from the console."
    fi
}

# Test connection
test_connection() {
    log_info "Testing Hasura connection..."
    
    # Test GraphQL endpoint
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "X-Hasura-Admin-Secret: ${HASURA_GRAPHQL_ADMIN_SECRET:-admin-secret}" \
        -d '{"query": "{ __schema { queryType { name } } }"}' \
        http://localhost:8080/v1/graphql)
    
    if [ "$response" = "200" ]; then
        log_success "GraphQL endpoint is working!"
    else
        log_error "GraphQL endpoint test failed (HTTP $response)"
        return 1
    fi
    
    # Test console access
    if curl -s http://localhost:8080/console > /dev/null; then
        log_success "Hasura console is accessible at http://localhost:8080/console"
    else
        log_warning "Could not access Hasura console"
    fi
}

# Display connection information
show_connection_info() {
    log_success "Hasura setup completed successfully!"
    echo
    log_info "Connection Information:"
    echo "  GraphQL Endpoint: http://localhost:8080/v1/graphql"
    echo "  GraphQL WebSocket: ws://localhost:8080/v1/graphql"
    echo "  Hasura Console: http://localhost:8080/console"
    echo "  Admin Secret: ${HASURA_GRAPHQL_ADMIN_SECRET:-admin-secret}"
    echo
    log_info "Next Steps:"
    echo "  1. Open the Hasura console: http://localhost:8080/console"
    echo "  2. Track your Supabase tables in the Data tab"
    echo "  3. Set up permissions for each role"
    echo "  4. Configure relationships between tables"
    echo "  5. Test GraphQL queries"
    echo
    log_info "Useful Commands:"
    echo "  View logs: docker-compose logs hasura"
    echo "  Stop services: docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Apply metadata: hasura metadata apply"
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Setup failed. Cleaning up..."
        cd "$SCRIPT_DIR" && docker-compose down 2>/dev/null || true
    fi
}

# Main execution
main() {
    trap cleanup EXIT
    
    echo "🚀 Hasura + Supabase Setup for 12thhaus Spiritual Platform"
    echo "=============================================================="
    echo
    
    check_prerequisites
    setup_environment
    download_ssl_cert
    install_hasura_cli
    initialize_hasura
    start_services
    apply_metadata
    test_connection
    show_connection_info
    
    log_success "Setup completed! Your Hasura instance is ready."
}

# Run main function
main "$@"