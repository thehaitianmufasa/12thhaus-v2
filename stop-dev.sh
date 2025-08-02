#!/bin/bash

# 12thhaus Development Server Stop Script
echo "🛑 Stopping 12thhaus Development Servers..."

# Kill processes on development ports
lsof -ti:3000,4000 | xargs kill -9 2>/dev/null && echo "✅ Servers stopped" || echo "ℹ️  No servers were running"

# Clean up any lingering Node processes
ps aux | grep -E "(next|node|npm)" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null

echo "🧹 All development servers stopped and cleaned up"