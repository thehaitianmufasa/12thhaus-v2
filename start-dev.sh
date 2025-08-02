#!/bin/bash

# 12thhaus Development Server Startup Script
echo "🚀 Starting 12thhaus Development Servers..."

# Kill any existing processes on the ports
echo "🔄 Cleaning up existing processes..."
lsof -ti:3000,4000 | xargs kill -9 2>/dev/null || echo "No existing processes to kill"

# Start GraphQL server in background
echo "📊 Starting GraphQL Server..."
cd /Users/mufasa/Desktop/Clients/12thhaus-v2/backend
npm start &
GRAPHQL_PID=$!

# Wait a moment for GraphQL to start
sleep 3

# Start frontend server
echo "💻 Starting Frontend Server..."
cd /Users/mufasa/Desktop/Clients/12thhaus-v2/frontend
npm run dev &
FRONTEND_PID=$!

# Show the PIDs for reference
echo "✅ Servers started:"
echo "   - GraphQL Server (PID: $GRAPHQL_PID): http://localhost:4000/graphql"
echo "   - Frontend Server (PID: $FRONTEND_PID): http://localhost:3000"
echo ""
echo "📝 To stop servers later:"
echo "   kill $GRAPHQL_PID $FRONTEND_PID"
echo ""
echo "🎯 Access your application at: http://localhost:3000"

# Keep script running to show logs
wait