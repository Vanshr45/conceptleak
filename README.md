# ConceptLeak

Scans ML datasets for data leakage before you waste time training on them.

Live demo: https://conceptleak.vercel.app

## Problem

Data leakage — when information about the target sneaks into training features — is one of the most common and hardest-to-catch mistakes in applied ML. It quietly inflates offline accuracy, and the model then fails in production. Most teams find it by accident, after the fact.

## What it does

- Scans an uploaded CSV/XLSX for 8 leakage patterns: direct ID leakage, PII/proxy variables, target leakage, temporal leakage, preprocessing leakage, injected noise, suspicious column-name patterns, and a general risk pass.
- Produces a 0-100 risk score per dataset using correlation and uniqueness-ratio checks.
- Runs a quick Random Forest before/after simulation so you can see the accuracy drop once leaky features are removed, not just a theoretical score.
- Gives per-feature fix suggestions (with Python snippets) and an AI chat for follow-up questions.

## Decisions and tradeoffs

- Rule-based and statistical detection over a black-box classifier: leakage detection needs to be explainable — you have to be able to tell someone why a column is flagged — so this uses interpretable heuristics (correlation, uniqueness ratio, name patterns) instead of training a leakage-detector model.
- A lightweight 5-tree Random Forest for the risk simulator: fast enough to run on upload instead of a heavier model, at the cost of some precision in the before/after comparison.
- Next.js/Postgres over a Python/Streamlit tool: most data leakage checks are internal Python scripts; building it as a hosted web app makes it usable by someone without a local Python environment.

## Tech stack

Next.js (App Router), TypeScript, Tailwind CSS + Radix UI, Recharts, Groq API (LLaMA 3.3 70B), PostgreSQL / Prisma (Neon), JWT auth + Google OAuth, Vercel.

## Status

Working prototype, iterated over about 15 commits. Detection rules are heuristic, not exhaustive — treat the risk score as a prioritized checklist, not a guarantee.

## Setup

```
git clone https://github.com/Vanshr45/conceptleak.git
cd conceptleak
npm install
cp .env.example .env.local
npm run dev
```

## Author

Vansh Rana — github.com/vanshr45 · linkedin.com/in/vansh-rana0429
