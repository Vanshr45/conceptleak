# ConceptLeak Backend Setup Guide

## Quick Start

### Option 1: Run Backend Only
```bash
npm run start:server
```
Server will run on http://localhost:3000

### Option 2: Run Backend + Frontend Together (Recommended)
```bash
npm run start:full
```
This starts both:
- **Backend Server** on http://localhost:3000
- **Expo Frontend** on http://localhost:8081 (web) or expo://...

### Option 3: Run Frontend Only (Mock Mode)
```bash
npm start
```
Frontend will use mock data and fallback services.

## What's Included

### Backend Server (`server.js`)
- Express.js REST API
- CORS enabled for frontend communication
- Mock data endpoints for development
- File upload support
- Health check endpoint

### API Endpoints

**Chat**
```
POST http://localhost:3000/api/chat
Body: { "message": "your message" }
```

**Upload CSV**
```
POST http://localhost:3000/api/upload
Files: multipart/form-data with file field
```

**Get Insights**
```
GET http://localhost:3000/api/insights
```

**List Datasets**
```
GET http://localhost:3000/api/datasets
```

**Get Specific Dataset**
```
GET http://localhost:3000/api/datasets/{id}
```

**Health Check**
```
GET http://localhost:3000/api/health
```

## Troubleshooting

### Port 3000 already in use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run start:server
```

### Concurrently not found
```bash
npm install
```

### Network errors still appearing
The warnings are now suppressed in normal mode. To see debugging info:
```bash
VERBOSE_API_LOGGING=true npm start
```

## Architecture

```
┌─────────────────────────────────────┐
│   Expo Mobile App (React Native)    │
│   - ChatScreen                      │
│   - DatasetsScreen                  │
│   - InsightsScreen                  │
│   - HomeScreen                      │
│   - ProfileScreen                   │
└──────────────┬──────────────────────┘
               │ API Calls (axios)
               ↓
┌─────────────────────────────────────┐
│    Express Backend Server           │
│    http://localhost:3000/api        │
│   - Chat endpoint                   │
│   - Upload endpoint                 │
│   - Insights endpoint               │
│   - Datasets endpoint               │
└─────────────────────────────────────┘
```

## Features

✅ **Mock Data**: All endpoints return realistic mock data  
✅ **CORS Enabled**: Works with Expo frontend  
✅ **File Upload**: Handles CSV uploads  
✅ **AI Integration**: Chat endpoint with keyword-based responses  
✅ **Development Ready**: No database or external dependencies  

## Next Steps

1. **Start the full stack**: `npm run start:full`
2. **Open the app**: Scan QR code or visit http://localhost:8081
3. **Test features**: Try Chat, Upload, and Insights
4. **Connect to production**: Update `API_BASE_URL` in `services/api.ts` when ready

