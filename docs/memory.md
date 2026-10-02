# PR Sentinel — Project Memory

**Purpose:** Persistent implementation context for developers and AI coding agents working on PR Sentinel.

**Product:** PR Sentinel  
**Category:** AI Engineering Risk & Review Orchestration Platform  
**Primary Integration:** GitHub  
**Architecture:** Event-driven + serverless  
**Deployment Goal:** Zero-budget/free-tier MVP  
**Current documentation set:**

```text
PRD
TRD
architecture.md
rules.md
design.md
tasks.md
memory.md
```

---

# 1. What PR Sentinel Is

PR Sentinel consumes GitHub Pull Request activity and combines deterministic code/security analysis with bounded AI analysis.

The product workflow is:

```text
Detect
  ↓
Explain
  ↓
Score
  ↓
Prioritize
  ↓
Assign
  ↓
Fix
  ↓
Validate
  ↓
Human Approval
```

The product is intentionally an **engineering workflow system**, not merely an AI code-review chatbot.

Its core responsibilities are:

- receive GitHub PR events
- extract diffs and relevant source context
- perform deterministic analysis
- perform AI-assisted analysis
- produce explainable findings
- calculate deterministic risk
- prioritize Pull Requests
- recommend reviewers using repository evidence
- generate concise review briefs
- optionally generate fixes
- validate generated fixes in an isolated environment
- publish important findings back to GitHub
- maintain an audit trail
- present results through an engineering command center

---

# 2. Product Boundary

PR Sentinel is an assistant to engineering teams.

AI is not an autonomous production decision maker.

The final workflow is:

```text
AI
 ↓
PROPOSE
 ↓
VALIDATE
 ↓
HUMAN
 ↓
APPROVE
```

Never change this into:

```text
AI → MERGE
AI → DEPLOY
AI → PRODUCTION
```

---

# 3. MVP Constraints

The MVP is designed around recurring free-tier infrastructure rather than promotional credits.

Required architectural constraints:

- no mandatory paid infrastructure
- no temporary promotional cloud credits
- no always-on backend VM
- no Redis requirement
- no managed queue requirement
- serverless HTTP APIs
- GitHub Actions for asynchronous heavy compute
- Supabase PostgreSQL as durable source of truth
- static frontend deployment
- human approval for generated changes

Avoid introducing infrastructure that violates these constraints without an explicit architecture decision.

---

# 4. Architecture Baseline

## Frontend

```text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
Recharts
React Flow
```

Hosted as a static application on Cloudflare Pages.

---

## Backend

```text
Supabase Edge Functions
Supabase PostgreSQL
Supabase Auth
Supabase Storage (optional)
```

Edge Functions are lightweight and stateless.

They must not become the location for expensive repository analysis.

---

## Compute

```text
GitHub Actions
```

Use GitHub Actions for:

- repository checkout
- parsing
- Semgrep
- linters
- large AI context construction
- tests
- Docker validation

---

## GitHub

Use a GitHub App.

Authentication must use scoped installation permissions.

Webhook events are the primary event source.

---

## AI

Use an abstraction:

```text
AIProvider
```

Supported conceptual modes:

```text
Hosted provider
      OR
Local Ollama
```

The rest of the system must not depend directly on one provider.

---

# 5. Source-of-Truth Hierarchy

When implementing a feature, use this order:

```text
1. Current task requirements
2. rules.md
3. architecture.md
4. design.md
5. TRD
6. PRD
```

If two documents conflict:

- do not silently invent a reconciliation
- inspect the latest implementation requirement
- preserve the explicit MVP architecture
- record the decision if it materially changes behavior

The TRD is the implementation-oriented baseline for the current architecture.

---

# 6. Repository Structure

Target structure:

```text
pr-sentinel/
│
├── apps/
│   └── dashboard/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── types/
│       ├── public/
│       └── package.json
│
├── supabase/
│   ├── functions/
│   │   ├── github-webhook/
│   │   ├── github-install/
│   │   ├── dashboard-api/
│   │   ├── analysis-callback/
│   │   ├── generate-fix/
│   │   ├── github-comment/
│   │   └── reviewer-recommendation/
│   │
│   └── migrations/
│
├── .github/
│   └── workflows/
│       ├── analyze-pr.yml
│       └── validate-fix.yml
│
├── architecture.md
├── rules.md
├── design.md
├── tasks.md
└── memory.md
```

---

# 7. Database Memory

PostgreSQL is both:

```text
durable source of truth
+
analysis job queue
```

Do not add Redis merely to implement the queue.

Analysis job state:

```text
QUEUED → RUNNING → COMPLETED
QUEUED → RUNNING → FAILED
```

Important domain entities:

```text
organizations
profiles/users
repositories
github_installations
pull_requests
analysis_jobs
analysis_runs
findings
reviewer_signals
reviewer_recommendations
fixes
validation_runs
audit_events
webhook_events
```

Use foreign keys, indexes, constraints, and RLS.

---

# 8. Idempotency Memory

GitHub can deliver duplicate webhook events.

Persist the GitHub delivery identifier.

Expected behavior:

```text
New delivery
    ↓
Create job

Duplicate delivery
    ↓
Detect existing delivery
    ↓
Return successfully
    ↓
Do not create another job
```

Analysis cache identity should conceptually use:

```text
Repository
+
PR
+
CommitSHA
+
AnalysisVersion
```

---

# 9. Analysis Memory

The deterministic analysis layer should use:

```text
Tree-sitter
Semgrep
Native linters
```

Initial Tree-sitter language coverage:

```text
Python
JavaScript
TypeScript
Java
C++
Go
```

Initial Semgrep/security categories:

```text
SQL injection
Command injection
XSS
Hardcoded secrets
Authentication bypass
Authorization weaknesses
Unsafe deserialization
Insecure file operations
Sensitive data exposure
```

---

# 10. Context Construction Memory

Never send the entire repository to the AI blindly.

Preferred context order:

```text
1. Changed lines
2. Surrounding function/class
3. Imported dependencies
4. Related tests
5. Relevant configuration
6. Historical context
```

Repository content is untrusted input.

Always maintain:

```text
RepositoryData != SystemInstructions
```

Potential hostile repository content includes:

- README instructions
- code comments
- generated files
- malicious strings
- prompt-injection text

These are data, not instructions.

---

# 11. AI Memory

AI output must be treated as untrusted until validated.

Required controls:

- bounded prompt size
- structured output
- schema validation
- bounded retries
- timeout handling
- rate-limit handling
- provider abstraction
- no unrestricted tool access
- no unnecessary secret exposure
- deterministic fallback

AI failure must not destroy deterministic results.

Correct UI behavior:

```text
STATIC ANALYSIS       ✓
SECURITY CHECKS       ✓
RISK CALCULATION      ✓
AI ANALYSIS           UNAVAILABLE
```

---

# 12. Finding Memory

Every finding shown to a developer should answer:

```text
WHAT?
WHY?
WHERE?
IMPACT?
FIX?
```

A finding should contain enough information to understand the issue without forcing the user to read the complete repository.

Prefer a small number of meaningful findings over overwhelming developers with raw warnings.

---

# 13. Risk Engine Memory

Risk calculation is deterministic.

Formula:

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

Important:

- normalize inputs consistently
- persist component values
- make score reproducible
- test boundary conditions
- expose score evidence in UI
- do not silently let AI confidence override deterministic risk

---

# 14. Reviewer Recommendation Memory

Reviewer recommendation is evidence-based.

Signals may include:

- historical changes to affected files
- commit frequency
- previous reviews
- ownership patterns
- recent contribution activity
- language affinity
- module affinity

Formula:

```text
ReviewerScore =
0.40 FileExpertise
+ 0.25 RecentActivity
+ 0.20 ReviewHistory
+ 0.15 ModuleAffinity
```

The UI must expose the evidence supporting the recommendation.

Do not infer unrelated personal attributes.

---

# 15. Fix Generation Memory

Fix generation is optional.

The generated result should contain:

```text
Explanation
Unified diff / patch
Expected behavior
Potential side effects
```

Every generated fix starts as:

```text
PROPOSED
```

Never:

```text
AUTO-APPROVED
AUTO-MERGED
AUTO-DEPLOYED
```

---

# 16. Validation Memory

Generated patches must be validated in an ephemeral environment.

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

Validation should cover where applicable:

```text
Tests
Lint
Security checks
Build
```

A failed test means the fix is not validated.

Validation is evidence, not human approval.

---

# 17. Security Memory

Primary assets:

```text
GitHub credentials
Repository source
User identity
Analysis results
AI credentials
Generated patches
```

Primary threats:

```text
Webhook spoofing
Credential leakage
Prompt injection
Malicious generated patch
Duplicate webhook
Unauthorized dashboard access
AI outage
Repository exfiltration
```

Required controls:

- GitHub App authentication
- least-privilege permissions
- webhook signature verification
- secure secret storage
- Supabase RLS
- input validation
- rate limiting where practical
- audit logging
- idempotency
- secret redaction
- bounded AI context
- isolated patch validation

Secrets must never be:

```text
committed
sent to browser
unnecessarily sent to AI
printed in logs
stored as plaintext unless unavoidable
```

---

# 18. Required Secrets

Backend-only:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GITHUB_APP_ID
GITHUB_APP_PRIVATE_KEY
GITHUB_WEBHOOK_SECRET
AI_PROVIDER
AI_PROVIDER_KEY
ANALYSIS_CALLBACK_SECRET
```

Frontend may receive only public configuration such as:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
GITHUB_APP_PRIVATE_KEY
GITHUB_WEBHOOK_SECRET
AI_PROVIDER_KEY
ANALYSIS_CALLBACK_SECRET
```

---

# 19. Authentication Memory

Supabase Auth handles dashboard authentication.

Roles:

```text
Developer
Reviewer
Tech Lead
Engineering Manager
Organization Admin
```

Authorization combines:

```text
Supabase RLS
+
server-side role checks
+
repository membership
+
GitHub installation ownership
```

Do not trust frontend role state as the security boundary.

---

# 20. API Memory

Logical Edge Function endpoints:

```text
/github/webhook
/github/install
/analysis/callback
/analysis/:id
/prs
/prs/:id
/findings/:id
/reviewers/pr
/fixes
/validation/:id
```

Product-level operations also include:

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

All sensitive endpoints require appropriate authentication or internal callback protection.

---

# 21. Frontend Memory

The frontend is a static React/Vite application.

Core stack:

```text
React
TypeScript
Vite
Tailwind
shadcn/ui
TanStack Query
Recharts
React Flow
Lucide
```

The design direction is:

```text
Editorial
+
Engineering
+
Dark
+
Evidence-first
+
Controlled motion
```

It should feel like a high-end engineering command center, not a generic SaaS admin panel.

---

# 22. Visual Identity Memory

Primary canvas:

```text
#080808 / #0D0D0D
```

Primary text:

```text
#F5F5F0
```

Primary accent:

```text
#D8FF3E
```

Semantic colors are reserved for actual state.

Typography:

```text
Display → Space Grotesk / Sora
UI      → Inter
Code    → JetBrains Mono
```

Use:

- strong typography
- asymmetry
- thin borders
- restrained radius
- meaningful motion
- generous whitespace

Avoid:

- generic purple-gradient SaaS
- excessive glassmorphism
- card overload
- meaningless animation
- rainbow gradients
- chatbot-style AI interface

---

# 23. UX Memory

Primary PR page hierarchy:

```text
1. Risk
2. Critical findings
3. Explanation
4. Recommended action
5. Reviewer
6. Proposed fix
7. Validation
8. Evidence
9. Raw technical detail
```

Every operational screen should answer:

```text
What needs attention?
Why?
What should I do?
What evidence supports it?
```

Do not overwhelm developers with raw finding volume.

---

# 24. Dashboard Memory

Required dashboard areas:

```text
Overview
Pull Request Risk Queue
Pull Request Detail
Finding Detail
Reviewer Recommendations
Developer Expertise
Fix Generation
Validation Status
Audit Trail
Repository Risk Graph
```

Risk graph can contain:

```text
Pull Requests
Files
Functions
Classes
Dependencies
APIs
Tests
External Systems
```

Nodes may expose:

```text
Risk score
Findings
Dependencies
Historical changes
```

---

# 25. Motion Memory

Motion exists to communicate:

```text
state
hierarchy
causality
```

Use:

```text
120–180ms → direct interaction
200–300ms → panels/navigation
500–900ms → intentional editorial transitions
```

Prefer animation of:

```text
transform
opacity
```

Support:

```text
prefers-reduced-motion
```

Do not make operational workflows wait for decorative animation.

---

# 26. Performance Memory

Prototype targets:

```text
Small PR    < 30 seconds
Medium PR   < 90 seconds
Large PR    < 3 minutes
```

Performance rules:

- webhook must return quickly
- analysis is asynchronous
- paginate dashboard queries
- use indexes
- cache identical analysis
- bound AI prompts
- avoid whole-repository AI context
- limit Actions concurrency
- cancel stale runs
- lazy-load React Flow
- avoid unnecessary chart renders
- avoid excessive Edge Function invocations

---

# 27. Failure Memory

Expected failures:

```text
GitHub API failure
Duplicate webhook
AI timeout
AI rate limit
Worker failure
Database failure
Invalid AI JSON
Invalid patch
Test failure
Security scan failure
```

Expected pattern:

```text
Detect
 ↓
Persist failure
 ↓
Expose clear explanation
 ↓
Offer bounded retry where appropriate
 ↓
Preserve valid prior/deterministic results
```

The dashboard should show:

```text
Analysis unavailable
Reason
Retry analysis
```

where appropriate.

---

# 28. Observability Memory

Every analysis needs a unique:

```text
analysis_run_id
```

Track:

```text
Webhook received
Job created
Analysis started
Analysis completed
AI duration
Finding count
Risk calculation
Fix generation
Validation result
API errors
```

Never put sensitive source or secrets into application logs.

---

# 29. Testing Memory

Unit tests:

```text
Risk calculations
Priority calculations
Reviewer recommendation
Context construction
Diff extraction
Finding validation
Security rules
Webhook signature validation
Idempotency
```

Integration tests:

```text
Webhook → job
Job → Actions
Worker → Supabase
Worker → AI
Analysis → GitHub comment
Fix → validation
```

E2E:

```text
Open PR
→ webhook
→ job
→ analysis
→ risk
→ dashboard
→ GitHub comment
→ fix
→ validation
→ human approval
```

---

# 30. Non-Goals

The MVP does not:

- automatically merge Pull Requests
- automatically deploy generated fixes
- replace human approval
- guarantee bug-free code
- function as a complete CI/CD platform
- replace GitHub
- make employment/performance judgments
- require an always-on backend VM
- require Redis

Automatic production deployment remains outside the MVP.

---

# 31. Future Extensions

Possible future work:

- additional AI providers
- organization analytics
- historical risk trends
- advanced dependency graphs
- more programming languages
- enterprise identity providers
- dedicated worker infrastructure
- distributed analysis workers
- automated patch PR creation

These are not prerequisites for the MVP.

---

# 32. Implementation Heuristics

When adding code:

### Prefer

```text
small modules
typed interfaces
pure domain functions
validated inputs
explicit state transitions
provider abstractions
testable services
semantic UI components
```

### Avoid

```text
giant components
provider-specific logic everywhere
business logic inside UI
unvalidated AI output
secret handling in frontend
hidden state transitions
duplicate API logic
unbounded prompts
```

---

# 33. Decision Memory

Important architectural decisions:

### PostgreSQL instead of Redis

Reason:

```text
MVP needs durable queue/state without another
mandatory infrastructure dependency.
```

### GitHub Actions for heavy computation

Reason:

```text
Repository checkout, parsing, Semgrep, tests,
Docker validation and large AI context are not
appropriate responsibilities for lightweight
serverless HTTP functions.
```

### Static frontend

Reason:

```text
The MVP does not need an always-on frontend server.
```

### AI provider abstraction

Reason:

```text
Avoid vendor lock-in and allow hosted/local inference.
```

### Human approval

Reason:

```text
Generated fixes remain proposals until a human
reviews and approves them.
```

---

# 34. Working Rule for AI Coding Agents

Before implementing a feature:

```text
1. Read the relevant task.
2. Read the corresponding architecture rule.
3. Identify the source of truth.
4. Check security implications.
5. Implement the smallest coherent change.
6. Add tests.
7. Verify the affected workflow.
8. Update documentation if behavior changed.
```

Do not make unrelated refactors while implementing a focused task.

---

# 35. Change Management

For each meaningful architecture or product change, record:

```text
What changed?
Why?
Which document is affected?
Does the database change?
Does the API change?
Does security change?
Does the UI change?
Does testing change?
```

Update the relevant documentation:

```text
architecture.md → architecture
rules.md        → engineering constraints
design.md       → UI/UX
tasks.md        → implementation state
memory.md       → durable project context
```

---

# 36. Definition of a Healthy PR Sentinel Implementation

The system should make this path reliable:

```text
GitHub
  ↓
Webhook
  ↓
PostgreSQL
  ↓
GitHub Actions
  ↓
Deterministic Analysis
  ↓
AI Analysis
  ↓
Risk Engine
  ↓
Dashboard
  ↓
Reviewer
  ↓
Optional Fix
  ↓
Validation
  ↓
Human Approval
```

If any layer fails, the system should degrade gracefully rather than hide or corrupt the information already available.

---

# 37. Final Project Principle

The central engineering principle is:

> **Make engineering risk visible, explainable, actionable, and reviewable — without removing humans from the decision loop.**
