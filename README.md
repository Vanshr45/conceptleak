# ConceptLeak 🚨

**ConceptLeak** is an intelligent machine learning dataset auditing platform designed to automatically detect and flag critical data leakage risks—such as proxy, target, and temporal leakage—before models are trained. It features an integrated AI assistant that helps data scientists evaluate feature health, understand specific privacy vulnerabilities, and implement actionable remediation strategies to ensure robust, generalizable AI models.

## ✨ Key Features

- 🛡️ **Automated Leakage Detection**: Scans datasets to identify Direct ID Leakage, PII/Proxy Leakage, Temporal Leakage, and Target Leakage.
- 🤖 **Integrated AI Assistant**: Chat with an integrated ML expert (powered by OpenRouter/Gemini) directly in your dashboard to understand your dataset's specific vulnerabilities and get remediation code.
- 📊 **Insight Dashboard**: Visualizes risk scores, critical warnings, and feature-level leakage alerts.
- 🔐 **Secure Authentication**: Built-in credential and Google OAuth login flows.
- 🌗 **Premium UI/UX**: Fully responsive, data-dense dark-mode interface built with Next.js, TailwindCSS, and Recharts.

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Deployment**: Vercel ready (Serverless & Edge)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Vanshr45/conceptleak.git
cd conceptleak
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```
Then, populate the variables:
- `OPENROUTER_API_KEY`: Your OpenRouter API Key (for the AI Chat).
- `GEMINI_API_KEY`: Fallback Gemini key.
- `JWT_SECRET`: A long random string for auth tokens.
- `AUTH_SECRET`: A long random string used by next-auth/custom auth.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: For Google OAuth.
- `NEXT_PUBLIC_APP_URL`: Typically `http://localhost:3000`.

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Deployment (Vercel)

This application is fully optimized for Vercel. 
To deploy, simply link your GitHub repository to Vercel and ensure all environment variables from `.env.local` are added to the Vercel Production Environment. 

*Note: The application includes a smart in-memory fallback to handle Vercel's Read-Only File System (EROFS) when storing JSON data.*

---
*Built to ensure your machine learning models actually generalize to the real world.*
