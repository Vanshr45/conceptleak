# ConceptLeak 🔍

> ML Dataset Auditing Platform — Detect concept leakage before it corrupts your model

ConceptLeak automatically scans ML datasets for critical data leakage risks before you train. Built for data scientists who want models that actually generalise.

**Live Demo → [conceptleak.vercel.app](https://conceptleak.vercel.app)**

**GitHub → [github.com/Vanshr45/conceptleak](https://github.com/Vanshr45/conceptleak)**

---

## Features

- Automated Leakage Detection — 8 leakage types: Direct ID, PII/Proxy, Target, Temporal, Preprocessing, Noise, Column Name Patterns, General Assessment
- Risk Scoring — 0-100 score per dataset with Pearson correlation and uniqueness ratio analysis
- Training Risk Simulator — Real Random Forest (5 trees, Gini impurity, bootstrap sampling)
- AI Assistant — Streaming chat powered by Groq LLaMA 3.3 70B with /REDACT /FILTER_LEAKS /SUMMARIZE_RISKS
- Insights Dashboard — Risk distribution charts, feature-level leakage cards with Python fix snippets
- Authentication — Email/password + Google OAuth, bcrypt hashing, 7-day JWT

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | TailwindCSS + Radix UI |
| Charts | Recharts |
| AI Model | Groq API LLaMA 3.3 70B streaming |
| Database | PostgreSQL via Prisma on Neon |
| Auth | JWT jose + bcryptjs + Google OAuth 2.0 |
| Deployment | Vercel |

---

## Getting Started

    git clone https://github.com/Vanshr45/conceptleak.git
    cd conceptleak
    npm install
    cp .env.example .env.local
    npm run dev

---

## Environment Variables

    DATABASE_URL=             # PostgreSQL connection string
    JWT_SECRET=               # Random string for JWT signing
    GROQ_API_KEY=             # groq.com
    OPENROUTER_API_KEY=       # Fallback AI
    GOOGLE_CLIENT_ID=         # Google OAuth
    GOOGLE_CLIENT_SECRET=     # Google OAuth
    NEXT_PUBLIC_APP_URL=      # https://conceptleak.vercel.app

---

## Architecture

    Upload CSV/XLSX
          down
    Leakage Detection Engine (analyzer.ts)
    Pearson correlation, uniqueness ratio, column name patterns
          down
    Risk Score 0-100 + Issue Cards with Python fix snippets
          down
    Training Risk Simulator (Random Forest)
    5 trees, Gini impurity, bootstrap sampling, 80/20 split
          down
    Before vs After Accuracy Comparison
          down
    AI Chat for Remediation Advice (Groq streaming)

---

## Author

**Vansh Rana** — B.Tech CSE, Data Science and AI

GitHub: https://github.com/vanshr45

LinkedIn: https://www.linkedin.com/in/vansh-rana0429

---

Built to ensure your ML models actually generalise to the real world.
