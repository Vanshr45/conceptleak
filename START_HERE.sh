#!/bin/bash
# ConceptLeak Quick Start Commands
# Copy and paste these commands to get running

# ===========================================
# 🚀 START EVERYTHING (Recommended)
# ===========================================
# npm run start:full

# This will open TWO things:
# 1. Backend API: http://localhost:3000
# 2. Expo Frontend: http://localhost:8081 (web)
#    OR Expo Go app (scan QR code on terminal)

# ===========================================
# 📱 Run Individual Components
# ===========================================

# Just the backend server
# npm run start:server

# Just the frontend (mock mode)
# npm start

# ===========================================
# 🧪 Test the Backend API
# ===========================================

# Health check
# curl http://localhost:3000/api/health

# Get insights with risk analysis
# curl http://localhost:3000/api/insights

# Send chat message
# curl -X POST http://localhost:3000/api/chat \
#   -H "Content-Type: application/json" \
#   -d '{"message":"What risks are in my data?"}'

# List datasets
# curl http://localhost:3000/api/datasets

# ===========================================
# 🔧 Troubleshooting
# ===========================================

# Port in use? Kill it
# lsof -ti:3000 | xargs kill -9

# Reinstall dependencies
# npm install

# Show debug logging
# VERBOSE_API_LOGGING=true npm start

# ===========================================
# 📚 Documentation
# ===========================================

# Read these files for more info:
# - BACKEND_SETUP.md (detailed setup guide)
# - BACKEND_FIXED.md (what was fixed)
# - services/api.ts (API client code)

echo "✅ ConceptLeak is ready to run!"
echo ""
echo "Quick start command:"
echo "  npm run start:full"
echo ""
echo "This will start both backend and frontend."
echo ""
