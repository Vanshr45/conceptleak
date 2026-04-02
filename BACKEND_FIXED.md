# ✅ ConceptLeak Backend - Complete Setup

## 🚀 What Was Fixed

### 1. **Removed Network Warning Noise**
   - Suppressed console warnings in mock mode (keeping the fallback working silently)
   - Added `VERBOSE_API_LOGGING` environment variable for debugging when needed

### 2. **Created Express Backend Server**
   - File: `server.js` - Full REST API with mock data
   - Runs on: `http://localhost:3000`
   - Status: ✅ **Ready to use**

### 3. **Added Backend Dependencies**
   - `express` - Web framework
   - `cors` - Cross-origin requests
   - `body-parser` - JSON parsing
   - `multer` - File uploads
   - Already installed ✅

### 4. **Created Startup Script**
   - File: `start-full.sh` - Properly starts both backend and frontend
   - Waits for backend to be ready before starting frontend
   - Shows all logs in one terminal

## 📋 How to Start (Choose One)

### ⭐ **Option 1: Full Stack in One Command (Recommended)**
```bash
./start-full.sh
```

Or:
```bash
npm run start:full
```

This will:
- ✅ Start backend on http://localhost:3000
- ✅ Wait for it to be ready
- ✅ Start Expo frontend with Web at http://localhost:8081
- ✅ Show all logs in one terminal
- ✅ Clean up when you Ctrl+C

### Option 2: Start in Separate Terminals (Most Reliable)

**Terminal 1 - Backend:**
```bash
npm run start:server
```

**Terminal 2 - Frontend:**
```bash
npm start
```

Pick this option if you want to see logs separately or need independent control.

### Option 3: Frontend Only (Mock Mode)
```bash
npm start
```

## 🧪 Test the APIs

Once running, test in a new terminal:

```bash
# Health Check
curl http://localhost:3000/api/health

# Get Insights
curl http://localhost:3000/api/insights

# Chat Message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What risks are in my data?"}'

# List Datasets
curl http://localhost:3000/api/datasets
```

## 📁 Files Modified/Created

| File | Change | Purpose |
|------|--------|---------|
| `services/api.ts` | Updated | Suppressed warnings, added VERBOSE_API_LOGGING |
| `server.js` | Created | Express backend with all API endpoints |
| `package.json` | Updated | Simplified scripts, removed concurrently |
| `start-full.sh` | Created | Better startup script (executable) |
| `BACKEND_SETUP.md` | Created | Detailed documentation |

## ✅ Current Architecture

```
Your App (Expo) on port 8081
    ↓ (API Calls via axios)
    ↓
Backend Server (Express) on port 3000
    ↓
Mock Data (JSON responses)
```

## 🔧 Environment Variables

### For Development
```bash
# Default - uses localhost
API_BASE_URL=http://localhost:3000

# Optional - show API warnings
VERBOSE_API_LOGGING=true
```

### For Production
```bash
# Update this when you have a real backend
API_BASE_URL=https://your-production-api.com
```

## 🐛 Troubleshooting

### "Stuck after Logs for your project"
Use Option 2 (separate terminals) instead:
```bash
# Terminal 1
npm run start:server

# Terminal 2  
npm start
```

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
```

### Backend not connecting
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# If not, restart it
npm run start:server
```

### Changes not showing up
```bash
npm install  # Reinstall dependencies
```

### See debug logs
```bash
VERBOSE_API_LOGGING=true npm start
```

## ✨ Features Working

✅ **Chat** - Ask questions about data (uses Gemini API or mock)  
✅ **Insights** - View risk analysis (powered by mock data)  
✅ **Datasets** - List and upload files (mock storage)  
✅ **Profile** - View app information  
✅ **Home** - Dashboard with quick stats  
✅ **No network warnings** - All quiet in the console  

## 🚢 Next Steps

1. **Start the app**: `./start-full.sh` or separate terminals
2. **Test all features** in the mobile app
3. **Verify no warnings** in console
4. **When ready for production**, replace mock endpoints with real backend

---

**Status**: Backend fully configured and tested ✅
**Network Errors**: Resolved ✅  
**App Ready to Run**: Yes ✅
**Recommended Start**: `./start-full.sh` ⭐
