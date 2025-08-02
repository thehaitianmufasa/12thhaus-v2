#!/bin/bash

# 12thhaus v2.0 Development Server Startup Script
# This script ensures reliable startup of both GraphQL backend and Next.js frontend

set -e  # Exit on any error

echo "🚀 Starting 12thhaus v2.0 Development Environment..."
echo "================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill processes on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Cleaning up port $port...${NC}"
    if check_port $port; then
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Clean up any existing processes
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
kill_port 3000  # Frontend
kill_port 4000  # GraphQL Backend

# Navigate to project root
cd /Users/mufasa/Desktop/Clients/12thhaus-v2

# Validate project structure
if [ ! -f "server.js" ]; then
    echo -e "${RED}❌ GraphQL server.js not found in project root${NC}"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Frontend directory not found${NC}"
    exit 1
fi

# Start GraphQL Backend
echo -e "${GREEN}🔧 Starting GraphQL Backend Server...${NC}"
echo "   Location: http://localhost:4000/graphql"

# Navigate to backend directory and start GraphQL server in background with logging
cd /Users/mufasa/Desktop/Clients/12thhaus-v2/backend
npm start > ../graphql-server.log 2>&1 &
GRAPHQL_PID=$!

# Wait for GraphQL server to be ready
echo -e "${YELLOW}⏳ Waiting for GraphQL server to start...${NC}"
for i in {1..30}; do
    if check_port 4000; then
        echo -e "${GREEN}✅ GraphQL Server ready at http://localhost:4000/graphql${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ GraphQL server failed to start within 30 seconds${NC}"
        echo "GraphQL server logs:"
        cat graphql-server.log
        exit 1
    fi
    sleep 1
done

# Navigate to frontend directory
cd frontend

# Ensure Tailwind CSS v4 configuration is correct
echo -e "${GREEN}🎨 Validating Tailwind CSS v4 configuration...${NC}"

# Check postcss.config.mjs
if [ ! -f "postcss.config.mjs" ]; then
    echo -e "${YELLOW}⚠️  Creating postcss.config.mjs for Tailwind v4...${NC}"
    cat > postcss.config.mjs << 'EOF'
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
EOF
fi

# Check globals.css for v4 syntax
if ! grep -q "@import \"tailwindcss\"" app/globals.css 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Updating globals.css for Tailwind v4...${NC}"
    
    # Backup existing globals.css
    cp app/globals.css app/globals.css.backup 2>/dev/null || true
    
    # Create new globals.css with v4 syntax
    cat > app/globals.css << 'EOF'
@import "tailwindcss";

/* Force light theme for spiritual platform */
:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-start-rgb));
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* Custom spiritual theme enhancements */
.spiritual-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
}

.backdrop-blur-spiritual {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
EOF
fi

# Clear Next.js cache to prevent stale CSS issues
echo -e "${YELLOW}🧹 Clearing Next.js cache for fresh CSS compilation...${NC}"
rm -rf .next
rm -rf node_modules/.cache 2>/dev/null || true

# Start Frontend
echo -e "${GREEN}🌐 Starting Next.js Frontend Server...${NC}"
echo "   Location: http://localhost:3000"

# Start frontend server in background with logging
npm run dev > ../frontend-server.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend server to be ready
echo -e "${YELLOW}⏳ Waiting for frontend server to start...${NC}"
for i in {1..60}; do
    if check_port 3000; then
        echo -e "${GREEN}✅ Frontend Server ready at http://localhost:3000${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${RED}❌ Frontend server failed to start within 60 seconds${NC}"
        echo "Frontend server logs:"
        cat ../frontend-server.log
        exit 1
    fi
    sleep 1
done

# Health check
echo -e "${GREEN}🏥 Running health checks...${NC}"

# Test GraphQL endpoint
if curl -s -f http://localhost:4000/graphql > /dev/null; then
    echo -e "${GREEN}✅ GraphQL API responding${NC}"
else
    echo -e "${RED}❌ GraphQL API not responding${NC}"
fi

# Test Frontend endpoint
if curl -s -f http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend responding${NC}"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
fi

echo ""
echo -e "${GREEN}🎉 12thhaus v2.0 Development Environment Ready!${NC}"
echo "================================================="
echo -e "📊 GraphQL Playground: ${YELLOW}http://localhost:4000/graphql${NC}"
echo -e "🌐 Frontend Application: ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "📋 Server Process IDs:"
echo -e "   GraphQL Backend: ${GRAPHQL_PID}"
echo -e "   Frontend Server: ${FRONTEND_PID}"
echo ""
echo -e "📝 Logs:"
echo -e "   GraphQL: ./graphql-server.log"
echo -e "   Frontend: ./frontend-server.log"
echo ""
echo -e "${YELLOW}💡 To stop servers: kill ${GRAPHQL_PID} ${FRONTEND_PID}${NC}"
echo -e "${YELLOW}💡 Or use: ./stop-servers.sh${NC}"

# Keep script running to maintain server processes
echo -e "${GREEN}🔄 Servers running... Press Ctrl+C to stop all servers${NC}"

# Trap Ctrl+C and cleanup
trap 'echo -e "${YELLOW}🛑 Stopping servers...${NC}"; kill $GRAPHQL_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Wait for servers to keep running
wait