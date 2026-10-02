# PR Sentinel — Engineering Rules

> **Project:** PR Sentinel  
> **Purpose:** AI Engineering Risk & Review Orchestration Platform  
> **Document:** Engineering Rules / Development Guardrails  
> **Version:** 1.0 — Hackathon MVP
>
> This document converts the PR Sentinel PRD/TRD requirements into implementation rules.
> When a requirement in this file conflicts with a newer approved architecture decision, the newer
> decision must be explicitly documented before implementation changes are made.

---

## 1. Rule Hierarchy

When making an implementation decision, follow this order:

1. **Security and data-protection requirements**
2. **Human approval and product non-goals**
3. **PR Sentinel architecture**
4. **Database/state consistency**
5. **Deterministic analysis correctness**
6. **AI safety and bounded context**
7. **Performance and free-tier constraints**
8. **Maintainability and provider abstraction**
9. **UI/UX implementation preferences**

Do not violate a higher-level rule merely to simplify implementation.

---

## 2. Core Product Rules

### R-001 — Human approval is mandatory

PR Sentinel is an engineering assistant, not an autonomous production decision maker.

The system must never:

- automatically merge a Pull Request
- automatically deploy a generated fix
- bypass human approval
- claim that generated code is guaranteed bug-free

Generated fixes and recommendations remain subject to human review.

### R-002 — Follow the canonical workflow

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

New features should fit into this workflow or have an explicitly documented reason for existing outside it.

### R-003 — Do not turn PR Sentinel into a replacement for GitHub

GitHub remains the source system for:

- Pull Requests
- commits
- repository content
- repository events
- reviews
- comments
- repository metadata

PR Sentinel is an intelligence and orchestration layer over GitHub.

### R-004 — Do not introduce employment or performance judgments

Developer expertise must be derived only from observable repository activity.

Do not infer or store unrelated personal attributes.

---

# 3. Architecture Rules

## R-010 — Keep the architecture event-driven

The system must use:

```text
GitHub Event
    ↓
Webhook
    ↓
PostgreSQL Job
    ↓
Ephemeral GitHub Actions Worker
    ↓
Analysis
```

Do not move heavy repository analysis into the webhook request path.

## R-011 — Webhooks must return quickly

The webhook handler must:

1. verify the request
2. identify the event
3. reject unsupported events
4. deduplicate the delivery
5. persist the event
6. create an analysis job
7. dispatch the worker
8. return an HTTP response

It must not wait for:

- Tree-sitter analysis
- Semgrep
- AI inference
- full repository processing
- tests
- patch validation

## R-012 — PostgreSQL is the MVP durable queue

Do not add Redis or another managed queue for the MVP.

`analysis_jobs` is the durable job queue and state store.

Allowed state transitions:

```text
QUEUED → RUNNING → COMPLETED
                  ↘ FAILED
                  ↘ CANCELLED
```

Invalid state transitions must be rejected.

## R-013 — Heavy computation belongs in GitHub Actions

Use ephemeral GitHub Actions workers for:

- repository checkout
- diff extraction
- source parsing
- Semgrep
- linters
- complexity analysis
- context construction
- AI inference
- test execution
- patch validation

Do not introduce an always-on worker server for MVP functionality.

## R-014 — Keep HTTP services lightweight

Supabase Edge Functions are responsible for lightweight:

- webhook handling
- API requests
- authentication/authorization checks
- job creation
- callbacks
- GitHub comment orchestration
- fix-generation requests

Large CPU/memory workloads belong in Actions workers.

## R-015 — Preserve replaceable infrastructure boundaries

Provider-specific integrations must remain behind interfaces.

This applies especially to:

- AI providers
- GitHub integration
- storage
- worker execution

Do not scatter provider-specific API calls throughout business logic.

---

# 4. GitHub Integration Rules

## R-020 — Use a GitHub App

GitHub repository integration must use a GitHub App with least-privilege permissions.

Do not use a developer's Personal Access Token as the application's permanent integration credential.

## R-021 — Verify every webhook signature

Every incoming GitHub webhook must be cryptographically verified before the payload is trusted.

Unverified webhook data must never create an analysis job.

## R-022 — Make webhook handling idempotent

Persist the GitHub delivery identifier in `webhook_events`.

The delivery identifier must be unique.

Duplicate deliveries must:

- return successfully
- avoid creating duplicate analysis jobs
- avoid duplicating downstream analysis

## R-023 — Support only documented events

MVP processing is defined around:

```text
pull_request.opened
pull_request.synchronize
pull_request.reopened
pull_request.closed
pull_request_review.submitted
push
```

Do not add expensive processing for arbitrary GitHub events without a documented requirement.

## R-024 — Keep GitHub permissions minimal

Request only the repository permissions required by the current implementation.

Do not ask for broad administrative permissions "just in case."

---

# 5. Analysis Pipeline Rules

## R-030 — Analysis must be deterministic where possible

Use deterministic analysis for signals that can be computed reliably without AI.

The pipeline must use:

- Tree-sitter for syntax-aware parsing
- Semgrep for deterministic security checks
- native language linters where appropriate
- complexity analysis
- diff/change analysis

AI should supplement deterministic analysis, not replace it.

## R-031 — Track the source of every finding

Every finding must distinguish whether it originated from:

- deterministic analysis
- AI analysis

Do not represent an AI-generated finding as a deterministic scanner result.

## R-032 — Extract change intelligence

The analysis worker should calculate:

- lines added
- lines removed
- files changed
- functions changed
- classes changed
- dependencies changed
- configuration changes
- database changes
- API changes
- test changes

These signals feed downstream risk analysis.

## R-033 — Initial Tree-sitter languages

The initial supported languages are:

- Python
- JavaScript
- TypeScript
- Java
- C++
- Go

Do not claim full language support beyond the implemented parser capabilities.

## R-034 — Security checks must be explicit

Initial Semgrep/security categories include:

- SQL injection
- command injection
- cross-site scripting
- hardcoded secrets
- authentication bypass patterns
- authorization weaknesses
- unsafe deserialization
- insecure file operations
- sensitive data exposure

New security categories should be added as explicit rules rather than hidden inside generic AI prompts.

---

# 6. AI Rules

## R-040 — Never send the entire repository blindly

The AI context must be constructed from relevant evidence.

Priority order:

```text
1. Changed lines
2. Surrounding function/method
3. Calling functions
4. Imported modules
5. Relevant tests
6. Relevant configuration
7. Relevant historical changes
```

## R-041 — Enforce hard context limits

The context builder must enforce limits on:

- file count
- source bytes
- estimated token count

Do not allow a Pull Request to create an unbounded AI request.

## R-042 — Repository content is untrusted

Treat:

- source files
- README files
- comments
- documentation
- commit messages
- configuration files

as untrusted data.

Repository content must never override system instructions.

Maintain the conceptual boundary:

```text
RepositoryData != SystemInstructions
```

## R-043 — AI must not receive unrestricted tool access

The AI provider must not receive unrestricted access to:

- repositories
- credentials
- production systems
- arbitrary network resources
- deployment systems

## R-044 — Validate all AI output

AI output must be schema-validated before persistence.

Invalid JSON or invalid schema output must be treated as an AI failure.

Do not persist malformed model output as a valid finding.

## R-045 — AI findings must be explainable

Each finding should answer:

```text
What?
Why?
Where?
Impact?
Fix?
```

A finding without enough evidence for a reviewer to understand the issue should not be presented as a high-confidence result.

## R-046 — AI confidence does not override deterministic risk

AI confidence may be stored and displayed.

It must not directly override the deterministic risk calculation.

## R-047 — AI failure must degrade gracefully

If the AI provider is unavailable:

- preserve the Pull Request
- preserve deterministic findings
- preserve the analysis record
- expose the AI failure
- allow retry

Do not mark the entire Pull Request as invalid solely because the AI provider failed.

## R-048 — Bound AI retries

Retry only transient AI failures.

Retries must:

- be bounded
- use appropriate backoff
- stop after a defined maximum
- avoid repeated calls for identical completed analyses

---

# 7. Risk Engine Rules

## R-050 — Risk must be deterministic

Risk scoring must be reproducible for the same:

```text
Repository
+
Pull Request
+
Commit SHA
+
Analysis Version
+
Risk Configuration
```

## R-051 — Use explicit risk dimensions

The MVP risk engine uses:

- Security Impact
- Business Impact
- Regression Risk
- Complexity
- Change Size
- Dependency Impact
- Historical Risk

Each dimension is normalized to `[0, 100]`.

## R-052 — Version risk configuration

Risk weights must be configurable and versioned.

Changing the risk formula must not silently rewrite the meaning of historical scores.

The current documented formula is:

```text
RiskScore =
    0.30S
  + 0.20B
  + 0.15R
  + 0.10C
  + 0.10D
  + 0.10H
  + 0.05Z
```

where:

```text
S = Security Impact
B = Business Impact
R = Regression Risk
C = Complexity
D = Dependency Impact
H = Historical Risk
Z = Change Size
```

## R-053 — Risk must be explainable

The dashboard should be able to show the signals contributing to a risk score.

Do not display a score without a path to the underlying evidence.

---

# 8. Reviewer Recommendation Rules

## R-060 — Recommendations must be evidence-based

Reviewer recommendations may use:

- historical changes to affected files
- commit frequency in affected modules
- previous reviews
- ownership patterns
- recent contribution activity
- language/module affinity

Do not use unrelated personal characteristics.

## R-061 — Expose recommendation evidence

The dashboard must be able to explain why a reviewer was recommended.

The documented recommendation model is:

```text
ReviewerScore =
    0.40 FileExpertise
  + 0.25 RecentActivity
  + 0.20 ReviewHistory
  + 0.15 ModuleAffinity
```

## R-062 — Recommendations are advisory

A recommendation must not:

- assign a reviewer without user control
- block a Pull Request
- replace engineering judgment

---

# 9. Fix Generation Rules

## R-070 — Fix generation is optional

A finding can exist without generating a fix.

Do not automatically generate patches for every finding.

## R-071 — Generated patches must be explicit

A generated fix must include, where available:

- explanation
- unified diff/patch
- expected behavior
- potential side effects

## R-072 — Never merge generated fixes automatically

Generated patches must remain outside the automatic merge path.

## R-073 — Never deploy generated fixes automatically

The MVP must not automatically deploy an AI-generated fix to production.

---

# 10. Validation Rules

## R-080 — Validate generated patches in isolation

Generated patches must be tested in an ephemeral environment.

Validation should include:

- tests
- lint
- security checks

## R-081 — Use restrictive sandboxing

Where Docker is used, validation should apply restrictions such as:

```text
--rm
--network none
--read-only
--cap-drop ALL
--security-opt no-new-privileges
--memory 1g
--cpus 1
```

The exact configuration may be adapted to the language/runtime.

## R-082 — Validation status must be explicit

Use:

```text
GENERATED
→ APPLIED
→ TESTING
→ VALIDATED
```

Failure/rejection states:

```text
TESTING → FAILED
GENERATED → REJECTED
```

A failed test must never be represented as `VALIDATED`.

---

# 11. Database Rules

## R-090 — PostgreSQL is the source of truth

Persistent application state belongs in Supabase PostgreSQL.

Do not treat:

- browser state
- GitHub comments
- Action logs
- AI provider state

as the authoritative application database.

## R-091 — Preserve core entities

The MVP database must support at least:

```text
profiles
organizations
repositories
github_installations
pull_requests
webhook_events
analysis_jobs
analysis_runs
findings
risk_scores
developer_signals
reviewer_recommendations
generated_fixes
validation_runs
audit_logs
```

## R-092 — Prevent duplicate analysis

Analysis jobs must prevent duplicate work for:

```text
Repository
+
Pull Request
+
Commit SHA
+
Analysis Version
```

## R-093 — Use indexes for common queries

Dashboard and queue queries must use appropriate indexes.

Do not compensate for missing indexes with unnecessarily expensive application-side filtering.

## R-094 — Keep artifacts minimal

Store only analysis artifacts required by the product.

Disposable artifacts should be archived or deleted according to the retention strategy.

---

# 12. Authentication and Authorization Rules

## R-100 — Use Supabase Auth

Dashboard authentication must use Supabase Auth.

## R-101 — Enforce authorization server-side

Authorization must include the appropriate combination of:

- Supabase RLS
- server-side role checks
- repository membership checks
- GitHub installation ownership checks

Never rely solely on frontend route protection.

## R-102 — Never expose privileged secrets

The following must never reach browser JavaScript:

```text
SUPABASE_SERVICE_ROLE_KEY
GITHUB_APP_PRIVATE_KEY
GITHUB_WEBHOOK_SECRET
AI_PROVIDER_KEY
ANALYSIS_CALLBACK_SECRET
```

Only intended public client configuration may be exposed to the frontend.

## R-103 — Protect tenant boundaries

An organization/repository user must never be able to access analysis data belonging to another organization/repository without explicit authorization.

---

# 13. API Rules

## R-110 — Keep API endpoints focused

The API boundary should expose focused operations such as:

```text
/github/webhook
/github/install
/analysis/:id
/analysis/callback
/prs
/prs/:id
/findings/:id
/reviewers/:pr
/fixes
/validation/:id
```

Avoid creating generic endpoints that bypass authorization or domain boundaries.

## R-111 — Protect sensitive endpoints

Sensitive API operations must require:

- authenticated user context, or
- a secure internal callback mechanism

## R-112 — Validate all external input

Validate:

- request body
- query parameters
- path parameters
- GitHub event payloads
- AI responses
- generated patches
- callback payloads

Never trust external input because it came from a known provider.

## R-113 — Keep callbacks authenticated

Analysis workers must not be able to submit arbitrary analysis results without validating the callback request.

---

# 14. Frontend Rules

## R-120 — Keep the frontend static

The dashboard must remain deployable as a static application.

Target stack:

```text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
TanStack Query
Recharts
React Flow
```

## R-121 — Do not put business secrets in the frontend

Frontend code must never contain:

- GitHub App private keys
- service-role keys
- AI provider keys
- webhook secrets
- internal callback secrets

## R-122 — Use cached server state appropriately

Use TanStack Query for server-state caching.

Avoid high-frequency polling.

Prefer:

- event-driven refresh
- bounded polling
- explicit retry
- cache invalidation

## R-123 — Paginate dashboard queries

Large PR/finding/repository datasets must not be loaded into the browser in one request.

---

# 15. Performance Rules

## R-130 — Keep webhook latency independent of analysis

Webhook response time must not depend on:

- repository size
- AI latency
- test duration
- Docker validation
- Semgrep duration

## R-131 — Respect prototype targets

Target execution times:

| PR size | Target |
|---|---:|
| Small | `< 30 seconds` |
| Medium | `< 90 seconds` |
| Large | `< 3 minutes` |

These are prototype targets, not guarantees.

## R-132 — Avoid unnecessary AI calls

Reuse analysis results when:

```text
Repository + PR + Commit SHA + Analysis Version
```

are unchanged.

## R-133 — Cancel stale work

When a newer commit arrives for the same Pull Request:

- prefer the newest commit
- cancel stale analysis runs where practical
- prevent obsolete results from replacing newer results

## R-134 — Limit concurrency

GitHub Actions workflows should limit concurrency per repository.

Do not allow an event burst to create uncontrolled parallel analysis jobs.

---

# 16. Free-Tier Rules

## R-140 — No mandatory paid infrastructure

The MVP must not require:

- paid cloud subscriptions
- promotional cloud credits
- always-on VMs
- managed Redis
- managed Kubernetes
- paid container registries

## R-141 — Treat free quotas as finite

The application must be quota-aware.

Avoid:

- unnecessary workflow runs
- excessive AI calls
- high-frequency polling
- storing unnecessary artifacts
- oversized prompts

## R-142 — Keep infrastructure replaceable

Free-tier services may change their quotas or pricing.

Provider-specific code must therefore remain isolated.

---

# 17. Logging and Observability Rules

## R-150 — Give every analysis a run ID

Every analysis execution must receive:

```text
analysis_run_id
```

## R-151 — Record important lifecycle events

At minimum, log/record:

```text
Webhook received
Analysis job created
Analysis started
Analysis completed
AI request duration
Finding count
Risk calculation
Fix generation
Validation result
API errors
```

## R-152 — Never log secrets

Never log:

- API keys
- private keys
- webhook secrets
- service-role keys
- authentication tokens

## R-153 — Avoid logging raw repository content

Do not write sensitive source code or unnecessary repository contents into application logs.

Logs should contain identifiers and metadata rather than entire files or prompts.

---

# 18. Error Handling Rules

## R-160 — Fail explicitly

Never silently swallow:

- GitHub API errors
- database errors
- AI errors
- parsing errors
- validation errors
- security scan errors

## R-161 — Preserve partial results

A failure in one subsystem must not unnecessarily destroy valid results from another subsystem.

Example:

```text
AI unavailable
    ↓
Deterministic findings remain valid
    ↓
Risk can still be calculated from available signals
    ↓
Dashboard exposes AI unavailable state
```

## R-162 — Distinguish retryable and permanent failures

Retry transient failures such as:

- temporary provider outage
- transient GitHub API failure
- temporary network failure

Do not blindly retry:

- malformed AI output
- invalid patches
- authorization failures
- unsupported events
- invalid input

## R-163 — Preserve failure state

Failed jobs must remain inspectable.

Do not delete failure records simply to make the dashboard appear healthy.

---

# 19. Testing Rules

## R-170 — Unit-test deterministic business logic

Unit tests must cover:

- risk calculations
- priority calculations
- reviewer recommendation
- context construction
- diff extraction
- finding validation
- security rules
- webhook signature validation
- idempotency

## R-171 — Integration-test system boundaries

Integration tests must cover:

```text
GitHub webhook → job creation
Job → GitHub Actions
Worker → Supabase
Worker → AI provider
Analysis → GitHub comment
Fix generation → validation
```

## R-172 — Maintain one complete E2E flow

The E2E test must exercise:

```text
PR creation
→ webhook
→ job
→ analysis
→ risk
→ dashboard
→ GitHub comment
→ fix generation
→ validation
→ human approval state
```

## R-173 — Test failure paths

Do not test only the happy path.

At minimum test:

- duplicate webhook
- AI timeout
- invalid AI JSON
- GitHub API failure
- worker failure
- invalid patch
- failed test
- failed security scan
- unauthorized API access

---

# 20. Code Quality Rules

## R-180 — Keep domain logic separate from infrastructure

Business logic should not be tightly coupled to:

- Supabase SDK calls
- GitHub SDK calls
- AI SDK calls
- UI components

Use clear service/provider boundaries.

## R-181 — Avoid giant functions

Separate:

- input validation
- domain logic
- persistence
- external API calls
- formatting
- error handling

A worker should be a pipeline of small, testable stages.

## R-182 — Prefer explicit data models

Use structured types/models for:

- findings
- analysis contexts
- risk dimensions
- risk scores
- reviewer recommendations
- generated patches
- validation results

Avoid passing untyped dictionaries/objects across major subsystem boundaries.

## R-183 — Do not hide important behavior

Risk weights, supported events, severity mappings, retry limits and context limits should be explicit configuration rather than unexplained magic constants.

## R-184 — Preserve backwards compatibility for stored analysis

Database changes must account for existing analysis records.

Do not silently reinterpret historical data.

---

# 21. Git and Change Management Rules

## R-190 — Keep changes focused

A Pull Request should ideally address one coherent change.

Avoid mixing:

- database migrations
- unrelated UI redesign
- AI prompt changes
- infrastructure changes

in the same change unless they are directly required together.

## R-191 — Database schema changes require migrations

Never manually modify production schema without a corresponding migration.

## R-192 — Analysis behavior changes require versioning

Changes to:

- risk formula
- AI analysis schema
- context construction
- deterministic security rules

should be versioned where they affect reproducibility or historical interpretation.

## R-193 — Never commit secrets

Before committing:

```text
.env
private keys
API keys
webhook secrets
service-role keys
AI credentials
tokens
```

must be checked.

Use environment variables or the appropriate secret store.

---

# 22. Dashboard Rules

The dashboard must expose enough information for a reviewer to understand:

### PR

- current risk
- changed scope
- important findings
- review priority
- recommended reviewers

### Finding

- what
- why
- where
- impact
- evidence
- suggested fix
- confidence/source

### Reviewer recommendation

- recommended candidate
- supporting repository evidence
- relevant expertise/history signals

### Fix

- proposed change
- patch
- expected behavior
- side effects
- validation status

### Audit

- important actions
- analysis lifecycle
- remediation lifecycle

---

# 23. Non-Goals — Do Not Implement These in MVP

The following are explicitly outside the MVP:

```text
Automatic PR merging
Automatic production deployment
Autonomous production decisions
Complete CI/CD replacement
GitHub replacement
Bug-free-code guarantees
Employment/performance judgments
Always-on worker VM
Redis requirement
```

Do not accidentally introduce these through "convenience" features.

---

# 24. Definition of Done

A feature is not complete merely because its UI works.

A feature is considered complete when applicable:

- [ ] Architecture boundary is respected
- [ ] Input is validated
- [ ] Authorization is enforced
- [ ] Secrets remain server-side
- [ ] Errors are handled explicitly
- [ ] Relevant database changes have migrations
- [ ] Idempotency is preserved where applicable
- [ ] Unit tests exist for deterministic logic
- [ ] Integration tests exist for external boundaries
- [ ] Logs contain useful identifiers
- [ ] Logs do not contain secrets/source dumps
- [ ] Free-tier constraints are respected
- [ ] Human approval is preserved
- [ ] Documentation is updated
- [ ] No MVP non-goal was accidentally introduced

---

# 25. Quick Reference — Absolute Rules

If you remember nothing else, remember these:

```text
1. Never merge AI-generated code automatically.
2. Never deploy AI-generated code automatically.
3. Never expose secrets to the browser.
4. Verify every GitHub webhook.
5. Make webhook handling idempotent.
6. PostgreSQL is the MVP job queue; do not add Redis.
7. Heavy computation runs in ephemeral GitHub Actions.
8. Never send the entire repository blindly to the AI.
9. Treat repository content as untrusted input.
10. Validate every AI response before persistence.
11. AI confidence must not override deterministic risk.
12. Reviewer recommendations must be evidence-based.
13. Generated patches must be validated in isolation.
14. Failed validation must never be reported as validated.
15. Preserve deterministic analysis when AI fails.
16. Bound retries, prompts, jobs and workflow concurrency.
17. Do not log secrets or unnecessary source code.
18. Use RLS and server-side authorization.
19. Version changes that affect risk/analysis reproducibility.
20. Keep humans responsible for final engineering decisions.
```

---

## 26. Source of Truth

This rules document is derived from the current PR Sentinel project requirements:

- `PR_Sentinel_PRD(1).pdf` — Product Requirements Document
- `PR_Sentinel_TRD.pdf` — Technical Requirements Document

The PRD defines the product goals, modules, workflow and MVP scope.

The TRD defines the implementation architecture, security requirements, data model, analysis pipeline, AI boundaries, risk engine, validation architecture, deployment model, testing strategy, performance targets and non-goals.

Where this file introduces an implementation convention rather than a direct PRD/TRD requirement, the convention should be treated as an engineering guardrail for the MVP and can be changed through an explicit architecture decision.
