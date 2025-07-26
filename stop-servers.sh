#!/bin/bash

# 12thhaus v2.0 Development Server Stop Script
# This script cleanly stops both GraphQL backend and Next.js frontend

echo "🛑 Stopping 12thhaus v2.0 Development Servers..."
echo "==============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to kill processes on port
kill_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}🔄 Stopping $service_name on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
        
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            echo -e "${RED}❌ Failed to stop $service_name${NC}"
        else
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        fi
    else
        echo -e "${YELLOW}ℹ️  $service_name not running on port $port${NC}"
    fi
}

# Stop servers
kill_port 3000 "Frontend Server"
kill_port 4000 "GraphQL Backend"

# Clean up any npm processes
echo -e "${YELLOW}🧹 Cleaning up npm processes...${NC}"
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

# Clean up log files
cd /Users/mufasa/Desktop/Clients/12thhaus-v2
rm -f graphql-server.log frontend-server.log

echo -e "${GREEN}✅ All servers stopped successfully${NC}"