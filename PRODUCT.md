# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript + Vite, Tailwind CSS, shadcn/ui, Lucide Icons, Recharts, React Flow (Cloudflare Pages deploy target)

## Users

1. **Developers**: Author PRs, need fast non-noisy feedback, actionable explanations, and pre-validated fix proposals without leaving their GitHub flow.
2. **Code Reviewers**: Tasked with evaluating complex PRs, need prioritized risk alerts, architectural impact summaries, and focused review mode.
3. **Tech Leads**: Oversee code quality and architectural health, require repository risk graphs, dependency blast radius views, and workload distribution.
4. **Engineering Managers**: Track team review bottlenecks, risk trends, cycle time, and ROI metrics (time saved / regressions prevented).

## Product Purpose

PR Sentinel is an AI-assisted engineering risk and review orchestration platform for GitHub Pull Requests. Its mission is captured by the motto: *"Don’t review every PR. Review the PRs that matter."* It eliminates code review bottlenecks and stops bugs/regressions before reaching production by detecting, explaining, prioritizing, assigning, fixing, and validating pull requests through an engineering command center.

## Positioning

Unlike generic AI code summarizers or superficial PR comment bots that dump noisy inline comments, PR Sentinel is an evidence-first review orchestration system combining deterministic analysis (Tree-sitter AST, Semgrep rules, git churn, test coverage delta) with structured AI synthesis, an isolated fix validation sandbox (Docker/GitHub Actions), and repository-grounded reviewer expertise matching. It enforces strict human-in-the-loop control: AI never pushes to production directly.

## Operating Context

- **GitHub Ecosystem**: GitHub Apps, Webhooks (`pull_request`, `pull_request_review`, `check_run`), PR comments/checks.
- **Engineering Command Center**: Dark-mode, editorial, data-dense web application for triage, queue inspection, risk graph exploration, and audit trails.
- **CI/CD & Ephemeral Compute**: GitHub Actions execution runner executing static analysis, testing, and patch verification in sandboxed containers.
- **Zero-Budget Free-Tier Architecture**: Cloudflare Pages (Frontend), Supabase PostgreSQL & Auth & Edge Functions (Backend/Storage/Job Queue), Gemini API / Ollama fallback.

## Capabilities and Constraints

- **Deterministic & AI Risk Scoring**: Composite multi-dimensional scoring (Security, Bug probability, Regression blast radius, Complexity, Test delta) categorized into Critical, High, Medium, Low.
- **Context-Aware Findings**: Every finding provides 5-part explainability: What, Where (file/lines), Why, Impact, Evidence.
- **Reviewer Recommendation**: Recommends reviewers based on measurable git commit recency, file ownership, and historical review acceptance.
- **AI Review Brief**: Concise, scannable briefing for reviewers before opening large diffs.
- **Sandboxed Fix Validation**: Ephemeral patch validation with unit test runner verification before human approval.
- **Audit Timeline**: Immutable chronological log of ingestion, analysis, scoring, fixes, validations, and approval actions.
- **Non-Goals**: Not a full IDE, not an auto-merging bot, not an arbitrary natural language chat assistant.

## Brand Commitments

- **Tone & Persona**: Authoritative, precise, editorial, quiet confidence. An engineering instrument built for senior engineers.
- **Visual Design North Star**: *"Make engineering risk feel visible. Make evidence feel tangible. Make action feel obvious."*
- **Aesthetic Guidance**: High-end dark editorial interface, technical monospace metadata (JetBrains Mono / Fira Code), strong typographic hierarchy, restrained purposeful motion, zero superficial AI chat bubbles or excessive neon glow.

## Evidence on Hand

- Exhaustive architectural and functional specifications in [docs/PR_Sentinel_PRD.md](file:///c:/Projects/PR%20Sentinal/docs/PR_Sentinel_PRD.md).
- Detailed technical design, database schemas, and API contracts in [docs/PR_Sentinel_TRD.md](file:///c:/Projects/PR%20Sentinal/docs/PR_Sentinel_TRD.md).
- Visual design specification, color tokens, and layout guidelines in [docs/design.md](file:///c:/Projects/PR%20Sentinal/docs/design.md).
- System architecture diagram and flow in [docs/architecture.md](file:///c:/Projects/PR%20Sentinal/docs/architecture.md).

## Product Principles

1. **Evidence Over Hallucination**: Every score, warning, and recommendation must link to verifiable repository artifacts, AST nodes, or static analysis findings.
2. **Signal Over Noise**: Prioritize critical risks; never drown engineers in low-severity stylistic warnings.
3. **Human in the Loop**: AI proposes and validates; humans approve and merge.
4. **Instrument Feel**: The interface is a high-precision cockpit for engineering decisions, responsive, fast, and dense with meaning.
5. **Deterministic Boundaries**: Clearly distinguish deterministic facts from generative AI suggestions in every screen.

## Accessibility & Inclusion

- Keyboard navigability across all queue items, tables, modals, and actions.
- High-contrast text compliance on dark themes; semantic color paired with explicit text labels/badges.
- Full support for `prefers-reduced-motion`.
