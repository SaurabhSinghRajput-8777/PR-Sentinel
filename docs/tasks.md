# PR Sentinel — Implementation Tasks

**Project:** PR Sentinel — AI Engineering Risk & Review Orchestration Platform  
**Purpose:** Convert the PRD, TRD, architecture, rules, and design specifications into an executable implementation backlog.

---

# 1. Task Rules

## Priority

- **P0** — MVP / required for a functional demo
- **P1** — Differentiation / important after the core workflow
- **P2** — Demo-killer / advanced MVP capabilities
- **P3** — Future extension

## Status

Use:

```text
[ ] Not started
[~] In progress
[x] Completed
[!] Blocked
```

## Dependency Rule

A task should not be marked complete merely because its code exists.

A task is complete when:

1. implementation exists,
2. relevant tests pass,
3. security constraints are satisfied,
4. the UI/API behavior matches the specification,
5. the task's acceptance criteria are satisfied.

---

# 2. Product Workflow

The implementation must converge on:

```text
GitHub Event
    ↓
Webhook
    ↓
Persist Job
    ↓
Analysis Worker
    ↓
Static Analysis
    ↓
AI Analysis
    ↓
Risk Calculation
    ↓
Prioritization
    ↓
Reviewer Recommendation
    ↓
Review Brief
    ↓
Optional Fix
    ↓
Isolated Validation
    ↓
Human Approval
```

The product is an engineering workflow system. AI assists the workflow; it does not replace human approval.

---

# 3. Phase 0 — Repository Foundation

## P0

### Project bootstrap

- [x] Create repository structure from the TRD.
- [x] Create `apps/dashboard`.
- [x] Create `apps/dashboard/src/components`.
- [x] Create `apps/dashboard/src/pages`.
- [x] Create `apps/dashboard/src/hooks`.
- [x] Create `apps/dashboard/src/lib`.
- [x] Create `apps/dashboard/src/types`.
- [x] Create `apps/dashboard/public`.
- [x] Create `supabase/functions`.
- [x] Create `supabase/migrations`.
- [x] Create `.github/workflows`.
- [x] Add root README.
- [x] Add environment variable documentation.
- [x] Add `.gitignore`.
- [x] Add `.env.example` without real secrets.

### Frontend setup

- [x] Initialize React + TypeScript + Vite.
- [x] Configure Tailwind CSS.
- [x] Configure shadcn/ui.
- [x] Configure Lucide icons.
- [x] Configure routing.
- [x] Configure TanStack Query.
- [x] Configure Recharts.
- [x] Configure React Flow.
- [x] Establish design tokens from `design.md`.
- [x] Add typography system.
- [x] Add semantic severity/status colors.
- [x] Add dark visual theme.

### Backend setup

- [x] Create Supabase project.
- [x] Configure Supabase Auth.
- [x] Configure PostgreSQL.
- [x] Configure Edge Functions.
- [x] Configure local Supabase development workflow.
- [x] Add initial database migration.
- [x] Add RLS migration.
- [x] Add indexes migration.

### Acceptance

- [x] `npm run build` succeeds.
- [x] Dashboard loads locally.
- [x] Supabase connection works.
- [x] No privileged secret reaches browser code.

---

# 4. Phase 1 — Database & Domain Model

## P0

### Core entities

Implement tables for:

- [x] organizations
- [x] users / profiles
- [x] repositories
- [x] GitHub installations
- [x] pull requests
- [x] analysis jobs
- [x] analysis runs
- [x] findings
- [x] reviewers / reviewer signals
- [x] fixes
- [x] validation runs
- [x] audit events
- [x] webhook events

### Repository metadata

Store:

- [x] GitHub repository ID
- [x] owner
- [x] name
- [x] default branch
- [x] installation reference
- [x] timestamps

### Pull request metadata

Store:

- [x] GitHub PR ID
- [x] repository ID
- [x] title
- [x] author
- [x] status
- [x] risk score
- [x] priority score
- [x] commit SHA
- [x] timestamps

### Analysis jobs

Implement:

```text
QUEUED
  ↓
RUNNING
  ↓
COMPLETED

QUEUED
  ↓
RUNNING
  ↓
FAILED
```

- [x] Persist job status.
- [x] Persist retry count.
- [x] Persist error metadata.
- [x] Persist analysis version.
- [x] Persist commit SHA.
- [x] Persist timestamps.
- [x] Add indexes for queue retrieval.
- [x] Add idempotency constraints.

### Findings

Store:

- [x] severity
- [x] category
- [x] title
- [x] explanation
- [x] file
- [x] line range
- [x] impact
- [x] proposed fix
- [x] confidence
- [x] source (`deterministic` / `ai`)
- [x] validation state

### Audit trail

Record:

- [x] webhook received
- [x] job created
- [x] analysis started
- [x] analysis completed
- [x] AI request duration
- [x] finding count
- [x] risk calculation
- [x] fix generation
- [x] validation result
- [x] API errors

### Acceptance

- [x] Migrations apply cleanly.
- [x] RLS policies are tested.
- [x] Common dashboard queries are indexed.
- [x] Duplicate webhook delivery cannot create duplicate jobs.

---

# 5. Phase 2 — GitHub App Integration

## P0

### GitHub App

- [x] Create GitHub App.
- [x] Configure homepage URL.
- [x] Configure webhook URL.
- [x] Configure webhook secret.
- [x] Configure minimum repository permissions.
- [x] Enable required PR events.
- [x] Enable required push events.
- [x] Store installation metadata.

### Authentication

- [x] Implement GitHub App authentication.
- [x] Generate installation access tokens server-side.
- [x] Never expose private key to frontend.
- [x] Never expose GitHub credentials in logs.

### Webhook

- [x] Implement `/github/webhook`.
- [x] Verify webhook signature.
- [x] Parse event type.
- [x] Validate payload.
- [x] Persist delivery identifier.
- [x] Implement idempotency.
- [x] Ignore unsupported events.
- [x] Return quickly.
- [x] Create analysis job asynchronously.

### PR extraction

- [x] Retrieve PR metadata.
- [x] Retrieve changed files.
- [x] Retrieve diff.
- [x] Retrieve commit SHA.
- [x] Handle GitHub API failures.
- [x] Handle pagination.
- [x] Handle permission errors.

### Acceptance

- [x] A test PR triggers the webhook.
- [x] Invalid signatures are rejected.
- [x] Duplicate deliveries are idempotent.
- [x] Webhook does not wait for analysis completion.

---

# 6. Phase 3 — Analysis Worker

## P0

### GitHub Actions

Create:

```text
.github/workflows/analyze-pr.yml
.github/workflows/validate-fix.yml
```

- [x] Trigger analysis only for supported events.
- [x] Receive minimum required secrets.
- [x] Retrieve queued analysis job.
- [x] Mark job `RUNNING`.
- [x] Checkout repository.
- [x] Execute analysis.
- [x] Persist results.
- [x] Call analysis callback.
- [x] Mark job `COMPLETED` or `FAILED`.

### Concurrency

- [x] Limit concurrency per repository.
- [x] Cancel stale analysis when a newer commit arrives where appropriate.
- [x] Avoid unnecessary workflow executions.
- [x] Skip irrelevant file changes where possible.

### Acceptance

- [x] Webhook → DB job → Actions worker works end-to-end.
- [x] Worker failure produces `FAILED`.
- [x] Failure reason is visible in dashboard.
- [x] Retry can be triggered.

---

# 7. Phase 4 — Diff & Context Engine

## P0

### Diff extraction

- [x] Parse changed files.
- [x] Identify added lines.
- [x] Identify removed lines.
- [x] Identify surrounding context.
- [x] Normalize file paths.
- [x] Record language.
- [x] Record affected modules.

### Context construction

Context priority:

```text
1. Changed lines
2. Surrounding function/class
3. Imported dependencies
4. Related tests
5. Relevant configuration
6. Historical context
```

- [x] Bound context size.
- [x] Do not send complete repository blindly.
- [x] Remove unnecessary secrets.
- [x] Mark repository content as untrusted data.
- [x] Separate system instructions from repository data.

### Acceptance

- [x] Context is deterministic for the same commit.
- [x] Oversized context is bounded.
- [x] Secret-like content is excluded where appropriate.
- [x] Context builder has unit tests.

---

# 8. Phase 5 — Deterministic Static Analysis

## P0

### Tree-sitter

Initial supported languages:

- [x] Python
- [x] JavaScript
- [x] TypeScript
- [x] Java
- [x] C++
- [x] Go

Implement:

- [x] syntax parsing
- [x] changed-function extraction
- [x] changed-class extraction
- [x] dependency/reference extraction
- [x] AST metadata

### Semgrep

Implement rules/categories for:

- [x] SQL injection
- [x] command injection
- [x] XSS
- [x] hardcoded secrets
- [x] authentication bypass
- [x] authorization weaknesses
- [x] unsafe deserialization
- [x] insecure file operations
- [x] sensitive data exposure

### Linters

- [x] Detect available project linters.
- [x] Run appropriate language tooling.
- [x] Normalize output into finding schema.

### Acceptance

- [x] Static analyzers produce normalized findings.
- [x] Finding locations are accurate.
- [x] False parser failures do not crash the complete analysis.
- [x] Unit tests cover security rules.

---

# 9. Phase 6 — AI Analysis

## P0

### Provider abstraction

Create:

```text
AIProvider
├── analyzePR()
├── generateReviewBrief()
└── generateFix()
```

- [x] Implement provider interface.
- [x] Implement hosted provider adapter.
- [x] Implement local Ollama adapter where practical.
- [x] Make provider replaceable.
- [x] Keep provider-specific logic isolated.

### Prompt construction

- [x] Provide bounded context.
- [x] Include diff.
- [x] Include relevant code.
- [x] Include deterministic findings.
- [x] Include repository metadata only when needed.
- [x] Explicitly label repository content as untrusted.
- [x] Never grant unrestricted tool access.
- [x] Never unnecessarily include secrets.

### Structured output

AI must return validated structured data.

Implement:

- [x] JSON schema.
- [x] runtime validation.
- [x] invalid JSON handling.
- [x] malformed finding handling.
- [x] bounded retries.
- [x] timeout handling.
- [x] rate-limit handling.

### Finding explanation

Every user-visible finding must support:

```text
What?
Why?
Where?
Impact?
Fix?
```

### AI failure fallback

- [x] Preserve deterministic analysis.
- [x] Mark AI analysis unavailable.
- [x] Show reason.
- [x] Offer retry.
- [x] Do not invalidate the underlying PR.

### Acceptance

- [x] AI output is schema-valid.
- [x] Prompt size is bounded.
- [x] AI failure is recoverable.
- [x] Deterministic results remain available.

---

# 10. Phase 7 — Risk Engine

## P0

Implement deterministic risk calculation.

```text
RiskScore =
0.30 Security Impact
+ 0.20 Business Impact
+ 0.15 Regression Risk
+ 0.10 Complexity
+ 0.10 Dependency Impact
+ 0.10 Historical Risk
+ 0.05 Change Size
```

Tasks:

- [x] Define normalized input ranges.
- [x] Implement deterministic calculation.
- [x] Persist component scores.
- [x] Persist final risk score.
- [x] Implement risk bands.
- [x] Implement priority score.
- [x] Explain score composition in UI.
- [x] Unit test formula and boundaries.

### Acceptance

- [x] Same input always produces same score.
- [x] AI confidence cannot silently override deterministic risk.
- [x] Score can be reproduced from stored inputs.

---

# 11. Phase 8 — Review Queue

## P0

- [x] Build PR review queue API.
- [x] Sort/filter by risk.
- [x] Filter by severity.
- [x] Filter by repository.
- [x] Filter by status.
- [x] Paginate results.
- [x] Show analysis state.
- [x] Show finding counts.
- [x] Show risk score.
- [x] Show last analysis time.

### Acceptance

A developer can identify:

```text
Which PR needs attention?
Why?
What is its risk?
What is its current state?
```

without opening multiple screens.

---

# 12. Phase 9 — Reviewer Recommendation

## P1

Evidence signals:

- [x] file expertise
- [x] recent activity
- [x] review history
- [x] module affinity
- [x] ownership patterns
- [x] commit frequency
- [x] language affinity

Score:

```text
ReviewerScore =
0.40 FileExpertise
+ 0.25 RecentActivity
+ 0.20 ReviewHistory
+ 0.15 ModuleAffinity
```

Tasks:

- [x] Build repository activity dataset.
- [x] Calculate reviewer signals.
- [x] Calculate recommendation score.
- [x] Rank candidates internally for recommendation generation.
- [x] Persist evidence.
- [x] Expose supporting signals in dashboard.
- [x] Avoid unrelated personal attributes.
- [x] Add recommendation tests.

### Acceptance

The UI answers:

```text
Why was this reviewer recommended?
```

with repository evidence.

---

# 13. Phase 10 — Review Brief

## P1

- [x] Generate concise PR summary.
- [x] Summarize primary risk.
- [x] Summarize critical findings.
- [x] Identify important changed modules.
- [x] Include recommended review focus.
- [x] Show AI-assisted nature of the brief.
- [x] Validate structured output.

### Acceptance

A reviewer can understand the PR's important risk areas without reading every raw finding first.

---

# 14. Phase 11 — GitHub Comments

## P0

- [x] Implement GitHub comment endpoint.
- [x] Generate concise comment.
- [x] Include critical findings.
- [x] Include risk score.
- [x] Include dashboard link.
- [x] Avoid exposing secrets.
- [x] Prevent duplicate comments where practical.
- [x] Handle GitHub API errors.

### Acceptance

A completed analysis can publish an understandable result back to the PR.

---

# 15. Phase 12 — Fix Generation

## P2

- [x] Implement fix-generation endpoint.
- [x] Generate explanation.
- [x] Generate unified diff/patch.
- [x] Generate expected behavior.
- [x] Generate potential side effects.
- [x] Validate patch syntax.
- [x] Store proposed patch.
- [x] Mark fix as `PROPOSED`.
- [x] Never auto-merge.
- [x] Never auto-deploy.

### Acceptance

A generated fix is clearly presented as a proposal requiring validation and human approval.

---

# 16. Phase 13 — Isolated Validation

## P2

- [x] Create ephemeral validation job.
- [x] Apply generated patch.
- [x] Run tests.
- [x] Run lint.
- [x] Run security checks.
- [x] Run build where applicable.
- [x] Capture results.
- [x] Persist validation state.
- [x] Delete temporary environment.

Recommended Docker restrictions:

```text
--rm
--network none
--read-only
--cap-drop ALL
--security-opt no-new-privileges
--memory 1g
--cpus 1
```

### Acceptance

A validation result is reproducible and isolated from production credentials and host resources.

---

# 17. Phase 14 — Dashboard Design Implementation

## P0

Implement according to `design.md`.

### App shell

- [x] Navigation rail.
- [x] Mobile navigation.
- [x] Page header.
- [x] Global command/search where needed.
- [x] Authenticated shell.

### Overview

- [x] Hero risk statement.
- [x] Active risk metric.
- [x] PR queue preview.
- [x] Risk trend.
- [x] Recent analysis.
- [x] System status.

### PR queue

- [x] Editorial PR rows.
- [x] Risk score.
- [x] Severity counts.
- [x] Repository metadata.
- [x] Analysis status.
- [x] Filters.

### PR detail

- [x] PR header.
- [x] Risk score.
- [x] Risk breakdown.
- [x] Critical findings.
- [x] Diff viewer.
- [x] AI review brief.
- [x] Reviewer recommendation.
- [x] Fix proposal.
- [x] Validation status.
- [x] Audit timeline.

### Risk graph

- [x] React Flow graph.
- [x] PR nodes.
- [x] File nodes.
- [x] Function/class nodes.
- [x] Dependency nodes.
- [x] API nodes.
- [x] Test nodes.
- [x] Finding/risk metadata.

### States

- [x] Loading states.
- [x] Empty states.
- [x] Error states.
- [x] AI unavailable state.
- [x] Validation failed state.

---

# 18. Phase 15 — Design System

## P0

- [x] Implement dark base palette.
- [x] Implement semantic colors.
- [x] Implement typography tokens.
- [x] Implement spacing scale.
- [x] Implement radius scale.
- [x] Implement border system.
- [x] Implement button variants.
- [x] Implement status badges.
- [x] Implement risk badges.
- [x] Implement severity indicators.
- [x] Implement monospace technical labels.

### Motion

- [x] Page entry transitions.
- [x] Risk score animation.
- [x] Finding reveal.
- [x] Graph transitions.
- [x] Hover states.
- [x] Reduced-motion fallback.

### Rule

Motion must communicate state, hierarchy, or causality.

---

# 19. Phase 16 — Authentication & Authorization

## P0

Roles:

```text
Developer
Reviewer
Tech Lead
Engineering Manager
Organization Admin
```

Tasks:

- [x] Supabase Auth integration.
- [x] Login flow.
- [x] Session handling.
- [x] Protected routes.
- [x] Role checks.
- [x] Repository membership checks.
- [x] GitHub installation ownership checks.
- [x] RLS policies.
- [x] Server-side authorization.
- [x] Verify no service-role key reaches browser.

### Acceptance

Unauthorized users cannot access repository analysis data.

---

# 20. Phase 17 — Security Hardening

## P0

- [x] Webhook signature verification.
- [x] Input validation.
- [x] Least-privilege GitHub permissions.
- [x] Secure secret storage.
- [x] RLS.
- [x] Audit logging.
- [x] Idempotent event handling.
- [x] Rate limiting where practical.
- [x] Secret redaction.
- [x] Prompt-injection defenses.
- [x] Repository-data/system-instruction separation.
- [x] Patch validation isolation.
- [x] No unrestricted AI tools.

### Never

- [x] Do not store secrets in source.
- [x] Do not send secrets to frontend.
- [x] Do not put secrets in AI prompts unnecessarily.
- [x] Do not log repository secrets.
- [x] Do not auto-merge generated patches.
- [x] Do not auto-deploy generated fixes.

---

# 21. Phase 18 — API Layer

## P0

Implement logical endpoints:

```text
POST /github/webhook
POST /github/install
POST /analysis/callback
GET  /analysis/:id
GET  /prs
GET  /prs/:id
GET  /findings/:id
GET  /reviewers/pr
POST /fixes
GET  /validation/:id
```

Additional product-level operations from the PRD:

```text
POST /api/prs/{id}/analyze
GET  /api/prs/{id}/analysis
GET  /api/prs/{id}/risk-graph
GET  /api/prs/{id}/reviewer-recommendation
POST /api/prs/{id}/fix
POST /api/prs/{id}/validate-fix
GET  /api/reviews/queue
GET  /api/team/workload
```

Implementation tasks:

- [x] Define request schemas.
- [x] Define response schemas.
- [x] Validate input.
- [x] Authenticate sensitive endpoints.
- [x] Protect internal callback endpoints.
- [x] Normalize errors.
- [x] Add pagination.
- [x] Add request correlation IDs.
- [x] Add API tests.

---

# 22. Phase 19 — Observability

## P0

Every analysis should have:

```text
analysis_run_id
```

Log events:

- [x] webhook received
- [x] job created
- [x] analysis started
- [x] analysis completed
- [x] AI duration
- [x] finding count
- [x] risk calculation
- [x] fix generation
- [x] validation result
- [x] API errors

Do not log:

- [x] secrets
- [x] unnecessary source code
- [x] private credentials
- [x] raw sensitive prompts

---

# 23. Phase 20 — Error Handling & Recovery

## P0

Handle:

- [x] GitHub API failure
- [x] duplicate webhook
- [x] AI timeout
- [x] AI rate limit
- [x] worker failure
- [x] database failure
- [x] invalid AI JSON
- [x] invalid patch
- [x] test failure
- [x] security scan failure

For every failure define:

```text
Detection
→ Persist state
→ User-visible explanation
→ Retry policy
→ Recovery path
```

AI failure must not invalidate the underlying Pull Request.

---

# 24. Phase 21 — Testing

## P0

### Unit

- [ ] risk calculation
- [ ] priority calculation
- [ ] reviewer recommendation
- [ ] context construction
- [ ] diff extraction
- [ ] finding validation
- [ ] security rules
- [ ] webhook signature
- [ ] idempotency

### Integration

- [ ] GitHub webhook → job
- [ ] job → GitHub Actions
- [ ] worker → Supabase
- [ ] worker → AI provider
- [ ] analysis → GitHub comment
- [ ] fix generation → validation

### E2E

Simulate:

```text
Open PR
 ↓
Webhook
 ↓
Job
 ↓
Analysis
 ↓
Risk
 ↓
Dashboard
 ↓
GitHub comment
 ↓
Fix
 ↓
Validation
 ↓
Human approval
```

---

# 25. Phase 22 — Performance

Prototype targets:

```text
Small PR    < 30 seconds
Medium PR   < 90 seconds
Large PR    < 3 minutes
```

Tasks:

- [ ] Keep webhook latency independent of analysis.
- [ ] Paginate dashboard queries.
- [ ] Add DB indexes.
- [ ] Cache identical analysis results.
- [ ] Bound AI prompts.
- [ ] Avoid complete repository prompts.
- [ ] Avoid high-frequency polling.
- [ ] Limit Actions concurrency.
- [ ] Cancel stale runs.
- [ ] Lazy-load heavy graph UI.
- [ ] Optimize chart rendering.

---

# 26. Phase 23 — Free-Tier Constraints

## P0

The baseline MVP must not require:

- [ ] Railway
- [ ] Render paid instances
- [ ] AWS EC2
- [ ] Managed Redis
- [ ] Managed Kubernetes
- [ ] Always-on VPS
- [ ] Paid container registry
- [ ] Promotional cloud credits

Preferred baseline:

```text
Cloudflare Pages
        +
Supabase
        +
GitHub Actions
        +
GitHub App
        +
AI Provider abstraction
```

---

# 27. Phase 24 — Demo Preparation

## P0

Create controlled demo repository containing:

```text
Authentication
Payment
User Management
```

Create a deliberately risky PR.

Demo scenario:

1. [ ] Open Pull Request.
2. [ ] Receive webhook.
3. [ ] Create analysis job.
4. [ ] Analyze diff.
5. [ ] Detect security/bug risks.
6. [ ] Calculate risk.
7. [ ] Publish GitHub report.
8. [ ] Update dashboard queue.
9. [ ] Recommend reviewer.
10. [ ] Open AI review brief.
11. [ ] Generate potential fix.
12. [ ] Execute fix validation.
13. [ ] Display validation result.
14. [ ] Show human approval step.

---

# 28. Phase 25 — Final QA

## P0

### Functional

- [ ] GitHub integration works.
- [ ] Webhook works.
- [ ] Analysis job works.
- [ ] Static analysis works.
- [ ] AI analysis works.
- [ ] Risk score works.
- [ ] Dashboard works.
- [ ] GitHub comment works.
- [ ] Reviewer recommendation works.
- [ ] Fix generation works if P2 implemented.
- [ ] Validation works if P2 implemented.

### Security

- [ ] No exposed secrets.
- [ ] RLS verified.
- [ ] Webhook signature verified.
- [ ] AI prompt boundaries verified.
- [ ] Patch sandbox verified.

### UX

- [ ] Critical findings are immediately visible.
- [ ] Finding explanations are complete.
- [ ] Reviewer evidence is visible.
- [ ] Proposed fixes are clearly marked.
- [ ] Human approval is explicit.
- [ ] Empty/error/loading states work.
- [ ] Mobile layout works.
- [ ] Reduced motion works.

### Performance

- [ ] Webhook responds quickly.
- [ ] Dashboard queries are paginated.
- [ ] Large PRs remain bounded.
- [ ] AI context is bounded.
- [ ] Graph is not loaded unnecessarily.

---

# 29. Definition of Done

The MVP is considered ready when:

- [ ] A GitHub PR can trigger analysis.
- [ ] The webhook is verified and idempotent.
- [ ] The job is persisted in PostgreSQL.
- [ ] GitHub Actions performs heavy analysis.
- [ ] Deterministic security/code analysis runs.
- [ ] AI analysis runs through a provider abstraction.
- [ ] Findings are structured and explainable.
- [ ] Risk is calculated deterministically.
- [ ] The review queue displays prioritized PRs.
- [ ] Important findings can be published to GitHub.
- [ ] The dashboard exposes evidence.
- [ ] AI failure does not destroy deterministic analysis.
- [ ] Generated fixes, if enabled, are proposed rather than automatically applied.
- [ ] Generated fixes, if enabled, are validated in isolation.
- [ ] Human approval remains the final gate.
- [ ] Security and RLS tests pass.
- [ ] Unit/integration/E2E coverage for the critical workflow passes.
- [ ] The application can deploy using the defined free-tier architecture.

---

# 30. Suggested Execution Order

```text
FOUNDATION
    ↓
DATABASE
    ↓
GITHUB APP + WEBHOOK
    ↓
JOB QUEUE
    ↓
ANALYSIS WORKER
    ↓
DIFF + CONTEXT
    ↓
STATIC ANALYSIS
    ↓
AI ANALYSIS
    ↓
RISK ENGINE
    ↓
DASHBOARD
    ↓
GITHUB COMMENTS
    ↓
REVIEWER RECOMMENDATION
    ↓
FIX GENERATION
    ↓
VALIDATION
    ↓
SECURITY HARDENING
    ↓
TESTING
    ↓
DEMO
```

Do not start with advanced visual polish before the end-to-end data path exists.

---

# 31. Current Focus Rule

When choosing the next task, prioritize:

```text
1. Broken end-to-end workflow
2. Security boundary
3. Data correctness
4. Core user-visible functionality
5. Test coverage
6. Performance
7. Visual polish
8. Future extensions
```

A beautiful dashboard with no reliable analysis pipeline is not a functional PR Sentinel.

