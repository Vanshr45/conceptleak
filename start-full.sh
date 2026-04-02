#!/bin/bash

# ConceptLeak Full Stack Startup Script
# Starts both backend and frontend servers

set -e

PROJECT_DIR="/home/vansh/Desktop/cd/conceptleak"
cd "$PROJECT_DIR"

echo "╔═══════════════════════════════════════╗"
echo "║  ConceptLeak Full Stack Startup       ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check dependencies
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed"
    exit 1
fi

if ! npm list express > /dev/null 2>&1; then
    echo "📦 Installing dependencies..."
    npm install --silent > /dev/null 2>&1
fi

echo "🚀 Starting Backend Server..."
echo "   → http://localhost:5000"
echo ""

# Start backend in background
npm run start:server > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    sleep 0.5
done

if ! curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "❌ Backend failed to start. Check logs:"
    cat /tmp/backend.log
    exit 1
fi

echo ""
echo "🚀 Starting Expo Frontend..."
echo "   → http://localhost:8081 (web)"
echo "   → Scan QR code for mobile"
echo ""
echo "─────────────────────────────────────"
echo ""

# Start frontend in foreground
npm start

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null; exit" EXIT INT TERM
