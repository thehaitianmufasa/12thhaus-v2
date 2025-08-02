#!/bin/bash

# 12thhaus Reliable Server Startup
echo "🚀 Starting 12thhaus servers reliably..."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $port is already in use"
        return 0
    else
        echo "Port $port is available"
        return 1
    fi
}

# Clean shutdown function
cleanup() {
    echo "🛑 Shutting down servers..."
    if [ ! -z "$GRAPHQL_PID" ]; then
        kill $GRAPHQL_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Kill any existing processes
lsof -ti:3000,4000 | xargs kill -9 2>/dev/null || echo "No existing processes to kill"

# Start GraphQL server
echo "📊 Starting GraphQL server..."
cd /Users/mufasa/Desktop/Clients/12thhaus-v2/backend
nohup npm start > /tmp/graphql.log 2>&1 &
GRAPHQL_PID=$!
echo "GraphQL server started with PID: $GRAPHQL_PID"

# Wait for GraphQL to be ready
echo "⏳ Waiting for GraphQL server..."
for i in {1..30}; do
    if check_port 4000; then
        echo "✅ GraphQL server is ready on port 4000"
        break
    fi
    sleep 1
done

# Start frontend server
echo "💻 Starting Frontend server..."
cd /Users/mufasa/Desktop/Clients/12thhaus-v2/frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"

# Wait for frontend to be ready
echo "⏳ Waiting for Frontend server..."
for i in {1..30}; do
    if check_port 3000; then
        echo "✅ Frontend server is ready on port 3000"
        break
    fi
    sleep 1
done

# Save PIDs for later reference
echo "$GRAPHQL_PID" > /tmp/graphql.pid
echo "$FRONTEND_PID" > /tmp/frontend.pid

echo ""
echo "🎯 Servers are running:"
echo "   📊 GraphQL: http://localhost:4000/graphql (PID: $GRAPHQL_PID)"
echo "   💻 Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "📝 To stop: ./stop-dev.sh"
echo "📋 Logs: tail -f /tmp/graphql.log /tmp/frontend.log"
echo ""
echo "✅ Ready for development!"

# Keep script running to monitor servers
while true; do
    if ! kill -0 $GRAPHQL_PID 2>/dev/null; then
        echo "❌ GraphQL server died, restarting..."
        cd /Users/mufasa/Desktop/Clients/12thhaus-v2/backend
        nohup npm start > /tmp/graphql.log 2>&1 &
        GRAPHQL_PID=$!
        echo "$GRAPHQL_PID" > /tmp/graphql.pid
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend server died, restarting..."
        cd /Users/mufasa/Desktop/Clients/12thhaus-v2/frontend
        nohup npm run dev > /tmp/frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "$FRONTEND_PID" > /tmp/frontend.pid
    fi
    
    sleep 10
done