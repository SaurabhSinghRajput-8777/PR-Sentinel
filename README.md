# PR Sentinel

> **AI Engineering Risk & Review Orchestration Platform**  
> *“Don’t review every PR. Review the PRs that matter.”*

PR Sentinel is an AI-assisted engineering risk and review orchestration platform for GitHub Pull Requests. It consumes GitHub PR activity, performs deterministic and context-aware static/AI analysis, calculates a deterministic risk score, prioritizes reviews, recommends relevant reviewers from repository commit evidence, generates scannable review briefs, proposes fixes for supported findings, and validates fixes in sandboxed test environments before human approval.

---

## ⚡ Canonical Workflow

```text
GitHub Event
    ↓
Webhook (Supabase Edge Function)
    ↓
Persist Job (Supabase PostgreSQL analysis_jobs)
    ↓
Analysis Worker (GitHub Actions Ephemeral Compute)
    ↓
Static Analysis (Tree-sitter AST + Semgrep + Linters)
    ↓
AI Analysis (Gemini API / Ollama Provider Abstraction)
    ↓
Risk Calculation (Deterministic Multi-dimensional Scoring)
    ↓
Prioritization (Critical / High / Medium / Low)
    ↓
Reviewer Recommendation (Repository Commit & Ownership Signals)
    ↓
Review Brief (AI-assisted Architectural Summary)
    ↓
Optional Fix (AI-generated Patch Proposal)
    ↓
Isolated Validation (Docker/GitHub Actions Unit Tests & Linting)
    ↓
Human Approval (Developer / Tech Lead Sign-off)
```

---

## 🏗 Repository Structure

```text
pr-sentinel/
├── apps/
│   └── dashboard/          # React + TypeScript + Vite + Tailwind + shadcn/ui
│       ├── src/
│       │   ├── components/ # Atomic and complex domain UI components
│       │   ├── pages/      # Command Center, PR Details, Risk Graph, Analytics
│       │   ├── hooks/      # Data fetching, auth, and state hooks
│       │   ├── lib/        # API clients, Supabase client, utilities
│       │   └── types/      # Domain entity and API TypeScript definitions
│       └── public/
├── supabase/
│   ├── functions/          # Lightweight serverless TypeScript Edge Functions
│   │   ├── github-webhook/
│   │   ├── github-install/
│   │   ├── dashboard-api/
│   │   ├── analysis-callback/
│   │   ├── generate-fix/
│   │   ├── github-comment/
│   │   └── reviewer-recommendation/
│   └── migrations/         # PostgreSQL schema, indexes, and RLS policies
│       ├── 0001_initial.sql
│       ├── 0002_indexes.sql
│       └── 0003_rls.sql
├── worker/                 # Asynchronous analysis and validation workers (Python)
│   ├── analysis/
│   └── validation/
├── .github/
│   └── workflows/          # GitHub Actions orchestration (analyze-pr, validate-fix)
└── docs/                   # PRD, TRD, Architecture, Rules, Design System, Tasks
```

---

## 🚀 Quick Start

### 1. Dashboard (Frontend)

```bash
cd apps/dashboard
npm install
npm run dev
```

### 2. Environment Setup

Copy `.env.example` to `.env` or `apps/dashboard/.env.local` and configure your Supabase URL, Anon Key, and Gemini API key.

---

## 📜 Documentation

- [PRD — Product Requirements](file:///c:/Projects/PR%20Sentinal/docs/PR_Sentinel_PRD.md)
- [TRD — Technical Requirements](file:///c:/Projects/PR%20Sentinal/docs/PR_Sentinel_TRD.md)
- [System Architecture](file:///c:/Projects/PR%20Sentinal/docs/architecture.md)
- [Engineering Rules](file:///c:/Projects/PR%20Sentinal/docs/rules.md)
- [Design System & UX Spec](file:///c:/Projects/PR%20Sentinal/docs/design.md)
- [Implementation Backlog](file:///c:/Projects/PR%20Sentinal/docs/tasks.md)
