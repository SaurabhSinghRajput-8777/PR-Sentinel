# **PR Sentinel** 

AI Engineering Risk & Review Orchestration Platform 

## **Technical Requirements Document** 

Version 1.0 – Hackathon MVP 



<!-- Start of picture text -->
GitHub Webhook Analysis<br>Pull Request Ingestion Worker<br>Risk & AI Review Validate<br>Findings & Fix & Approve<br><!-- End of picture text -->

**Document Type:** Technical Requirements Document **Product:** PR Sentinel **Version:** 1.0 **Status:** Hackathon MVP **Primary Integration:** GitHub **Architecture:** Event-Driven + Serverless **Deployment Goal:** Zero-Budget Free-Tier Deployment 

September 2026 

**PR Sentinel** 

Technical Requirements Document 

### **Contents** 

|**1**|**Document Overview**|**4**|
|---|---|---|
||1.1<br>Purpose . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>4|
||1.2<br>Design Principle<br>. . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>4|
|**2**|**Technical Architecture Goals**|**4**|
|**3**|**Architecture Decisions**|**5**|
||3.1<br>Architecture Style<br>. . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>5|
||3.2<br>Why PostgreSQL is the Queue<br>. . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>5|
||3.3<br>Why Heavy Work Runs in GitHub Actions<br>. . . . . . . . . . .|. . . . . . . . . . . .<br>6|
|**4**|**Technology Stack**|**6**|
||4.1<br>Free-Tier Design Constraint . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>7|
|**5**|**Free-Tier Deployment Architecture**|**7**|
||5.1<br>Frontend Deployment<br>. . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>7|
||5.2<br>Backend Deployment . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>8|
||5.3<br>AI Deployment . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>8|
|**6**|**Repository Structure**|**8**|
|**7**|**GitHub Integration**|**9**|
||7.1<br>GitHub App. . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>9|
||7.2<br>Supported Events . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>9|
||7.3<br>Webhook Processing . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>10|
|**8**|**Data Model**|**10**|
||8.1<br>Core Tables . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>10|
||8.2<br>Analysis Job State . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>11|
||8.3<br>Validation State. . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>11|
|**9**|**Database Schema Requirements**|**11**|
||9.1<br>Analysis Jobs . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>11|
||9.2<br>Findings . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>11|
|**10**|**PR Analysis Pipeline**|**12**|
||10.1 Pipeline Stages . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>12|
||10.2 Change Extraction . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>12|
|**11**|**Context Construction**|**12**|
|**12**|**Static Code Intelligence**|**13**|
||12.1 Tree-sitter . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>13|
||12.2 Semgrep . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>13|
||12.3 Complexity . . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>14|
|**13**|**AI Analysis Engine**|**14**|
||13.1 Provider Abstraction . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>14|
||13.2 Provider Modes . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>14|
||13.3 Structured AI Output . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>15|
|**14**|**Risk Engine**|**15**|
||14.1 Risk Dimensions<br>. . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . .<br>15|



1 

**PR Sentinel** 

Technical Requirements Document 

|14.2 Deterministic Score . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>15|
|---|---|
|**15 Reviewer Recommendation**|**16**|
|15.1 Recommendation Score<br>. . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>16|
|**16 Fix Generation**|**16**|
|**17 Fix Validation**|**16**|
|**18 Dashboard Requirements**|**17**|
|18.1 Code-Risk Graph . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>17|
|**19 Authentication and Authorization**|**18**|
|**20 Security Architecture**|**18**|
|20.1 Application Security . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>18|
|20.2 Secret Management. . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>19|
|20.3 AI Security<br>. . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>19|
|**21 Caching and Idempotency**|**19**|
|21.1 Browser Cache<br>. . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>19|
|21.2 Analysis Cache . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>20|
|21.3 Webhook Idempotency . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>20|
|**22 API Requirements**|**20**|
|22.1 Publicly Reachable Endpoints . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>20|
|**23 Performance Requirements**|**20**|
|**24 Observability**|**21**|
|**25 Failure Handling**|**21**|
|**26 Testing Strategy**|**22**|
|26.1 Unit Tests . . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>22|
|26.2 Integration Tests . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>22|
|26.3 End-to-End Test . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>22|
|**27 Deployment Procedure**|**23**|
|27.1 Step 1 – Supabase<br>. . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>23|
|27.2 Step 2 – Cloudflare Pages . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>23|
|27.3 Step 3 – GitHub App<br>. . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>23|
|27.4 Step 4 – GitHub Actions . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>24|
|27.5 Step 5 – Environment Variables . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>24|
|**28 CI/CD Workflow**|**25**|
|**29 Free-Tier Operational Limits**|**25**|
|29.1 Supabase<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>25|
|29.2 Cloudflare Pages . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>25|
|29.3 GitHub Actions . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>25|
|29.4 AI Provider . . . . . . . . . . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . .<br>25|
|**30 Threat Model**|**26**|
|**31 Non-Functional Requirements**|**26**|



2 

|**PR Sentinel**|Technical Requirements Document|
|---|---|
|31.1 Availability<br>. . . . . . . . . . . . . .|. . . . . . . . . . . . . . . . . . . . . . . . . . .<br>26|
|31.2 Security . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . . . . . . . . . . . . . . .<br>26|
|31.3 Maintainability . . . . . . . . . . . .|. . . . . . . . . . . . . . . . . . . . . . . . . . .<br>26|
|31.4 Scalability . . . . . . . . . . . . . . .|. . . . . . . . . . . . . . . . . . . . . . . . . . .<br>27|
|31.5 Cost . . . . . . . . . . . . . . . . . .|. . . . . . . . . . . . . . . . . . . . . . . . . . .<br>27|
|**32 Technical Non-Goals**|**27**|
|**33 Future Extensions**|**27**|
|**34 Final Architecture**|**28**|
|**35 Conclusion**|**28**|



3 

**PR Sentinel** 

Technical Requirements Document 

### **1 Document Overview** 

#### **1.1 Purpose** 

This Technical Requirements Document (TRD) translates the PR Sentinel Product Requirements Document (PRD) into an implementable software architecture. 

PR Sentinel is an AI-assisted engineering risk and review orchestration platform. It consumes GitHub Pull Request activity, performs deterministic and AI-assisted analysis, identifies meaningful engineering risks, calculates a deterministic risk score, recommends reviewers, generates review briefs, proposes fixes for supported findings, and validates those fixes before human approval. 

The implementation is optimized for a hackathon MVP with the following constraints: 

- Zero mandatory infrastructure spend. 

- No temporary promotional cloud credits. 

- No always-on virtual machine. 

- No Redis or managed queue requirement. 

- Serverless HTTP APIs. 

- GitHub Actions for asynchronous compute. 

- Supabase PostgreSQL as the durable source of truth. 

- Static frontend deployment. 

- Human approval for generated changes. 

#### **1.2 Design Principle** 

The system follows: 

### **Detect** _→_ **Explain** _→_ **Score** _→_ **Prioritize** _→_ **Assign** _→_ **Fix** _→_ **Validate** _→_ **Human Approval** 

AI is an engineering assistant. It is not an autonomous production decision maker. 

### **2 Technical Architecture Goals** 

The implementation shall: 

1. Receive GitHub Pull Request events reliably. 

2. Store repository, installation, PR, and analysis metadata. 

3. Extract diffs and relevant source context. 

4. Perform deterministic static analysis. 

5. Perform AI-assisted analysis using bounded context. 

6. Generate structured and explainable findings. 

7. Calculate a deterministic risk score. 

8. Prioritize Pull Requests. 

4 

**PR Sentinel** 

Technical Requirements Document 

9. Build developer expertise signals from observable repository activity. 

10. Recommend reviewers using repository evidence. 

11. Generate a concise review brief. 

12. Generate potential fixes for supported findings. 

13. Validate generated fixes in an isolated environment. 

14. Display results through an engineering command center. 

15. Publish important findings back to GitHub. 

16. Maintain an audit trail for analysis and remediation actions. 

### **3 Architecture Decisions** 

#### **3.1 Architecture Style** 

PR Sentinel uses an event-driven architecture with serverless API functions and asynchronous GitHub Actions workers. 

The architecture deliberately separates: 

- HTTP/webhook ingestion. 

- Durable job state. 

- Heavy repository analysis. 

- AI inference. 

- Patch validation. 

- Dashboard presentation. 



<!-- Start of picture text -->
Supabase Edge<br>GitHub Supabase<br>Webhook<br>Pull Request PostgreSQL<br>Function<br>React + Vite Supabase Edge GitHub Actions AI Provider<br>Dashboard API Functions Analysis Worker Abstraction<br><!-- End of picture text -->

Figure 1: Logical System Architecture 

#### **3.2 Why PostgreSQL is the Queue** 

The MVP does not require Redis. 

A PostgreSQL `analysis_jobs` table acts as the durable job queue and state store: 

_QUEUED → RUNNING → COMPLETED_ 

5 

**PR Sentinel** 

Technical Requirements Document 

or: 

##### _QUEUED → RUNNING → FAILED_ 

This removes an additional infrastructure dependency while preserving durability and observability. 

#### **3.3 Why Heavy Work Runs in GitHub Actions** 

Supabase Edge Functions are intended for lightweight request handling. Repository checkout, parsing, Semgrep, tests, Docker-based validation, and large AI context construction are therefore executed by GitHub Actions. 

For public repositories, standard GitHub-hosted Actions runners are available without per-minute charges. The design should nevertheless keep workflows bounded and avoid unnecessary runs. 

### **4 Technology Stack** 

|**Layer**|**Technology**|**Technical Rationale**|
|---|---|---|
|Frontend|React + TypeScript +<br>Vite|Static SPA, fast development, easy de-<br>ployment|
|UI|Tailwind<br>CSS<br>+<br>shadcn/ui|Consistent engineering dashboard UI|
|Charts|Recharts|Lightweight risk and analytics visualiza-<br>tions|
|Graph|React Flow|Repository and dependency graph visu-<br>alization|
|Frontend Hosting|Cloudflare Pages|Static hosting with a recurring free plan|
|API|Supabase<br>Edge<br>Func-<br>tions|Serverless TypeScript API endpoints|
|Database|Supabase PostgreSQL|Managed<br>relational<br>database<br>and<br>durable queue|
|Authentication|Supabase Auth|Integrated authentication and JWT<br>handling|
|Storage|Supabase Storage|Optional reports and analysis artifacts|
|Queue|PostgreSQL<br>`analysis_jobs`|Removes Redis from the MVP|
|Worker|GitHub Actions|Ephemeral compute, especially suitable<br>for public repositories|
|Code Parsing|Tree-sitter|Syntax-aware parsing across supported<br>languages|
|Security Analysis|Semgrep CLI|Deterministic static security checks|
|Linters|Native language linters|Deterministic quality checks|
|AI|Provider abstraction|Prevents vendor lock-in|
|Demo AI|Gemini API free tier|Zero-cost development where free quota<br>is available|
|Local AI|Ollama|Local/private fallback without API cost|
|Git Integration|GitHub App|Scoped repository permissions|



6 

**PR Sentinel** 

Technical Requirements Document 

|Events|GitHub Webhooks|Near real-time PR event delivery|
|---|---|---|
|Validation|GitHub<br>Actions<br>+<br>Docker|Ephemeral patch testing|
|Logging|Supabase + Actions logs|Minimal additional infrastructure|
|Version Control|Git + GitHub|Source control and CI/CD|



#### **4.1 Free-Tier Design Constraint** 

The deployment architecture is specifically designed around recurring free quotas rather than promotional credits. 

The following infrastructure is intentionally excluded: 

- Railway. 

- Render paid instances. 

- AWS EC2. 

- Managed Redis. 

- Managed Kubernetes. 

- Always-on VPS instances. 

- Paid container registries. 

- Credit-based cloud trials. 

The exact limits of third-party free plans can change; the architecture therefore treats each service as replaceable through a small abstraction boundary. 

### **5 Free-Tier Deployment Architecture** 



<!-- Start of picture text -->
Supabase<br>Cloudflare Pages Supabase Edge<br>PostgreSQL<br>React/Vite Functions<br>+ Auth<br>GitHub Actions<br>Gemini / Ollama<br>Analysis + GitHub App<br>AI Provider<br>Validation<br><!-- End of picture text -->

Figure 2: Free-Tier Deployment Architecture 

#### **5.1 Frontend Deployment** 

The frontend is a Vite-generated static application. 

- 1 <mark>`Build command:`</mark> 

- 2 <mark>`npm run build`</mark> 

3 

- 4 <mark>`Output:`</mark> 

7 

**PR Sentinel** 

Technical Requirements Document 

- 5 <mark>`dist/`</mark> 

No continuously running Node.js server is required. 

#### **5.2 Backend Deployment** 

Supabase Edge Functions provide: 

- 1 <mark>`github -webhook`</mark> 

- 2 <mark>`github -install`</mark> 

- 3 <mark>`dashboard -api`</mark> 

- 4 <mark>`analysis -callback`</mark> 

- 5 <mark>`generate -fix`</mark> 

- 6 <mark>`github -comment`</mark> 

- 7 <mark>`reviewer - recommendation`</mark> 

The functions must remain stateless and lightweight. 

#### **5.3 AI Deployment** 

The primary hackathon mode uses a provider implementing the `AIProvider` interface. 

Two supported modes are: 

1. Hosted free-tier model, such as a Gemini model with an available free quota. 

2. Local Ollama inference during development. 

The application must never assume that the hosted provider is unlimited. 

### **6 Repository Structure** 

1 <mark>`pr -sentinel/`</mark> 2 <mark>`|`</mark> 3 <mark>`+-- apps/`</mark> 4 <mark>`| +-- dashboard/`</mark> 5 <mark>`| +-- src/`</mark> 6 <mark>`| | +-- components/`</mark> 7 <mark>`| | +-- pages/`</mark> 8 <mark>`| | +-- hooks/`</mark> 9 <mark>`| | +-- lib/`</mark> 10 <mark>`| | +-- types/`</mark> 11 <mark>`| +-- public/`</mark> 12 <mark>`| +-- package.json`</mark> 13 <mark>`|`</mark> 14 <mark>`+-- supabase/`</mark> 15 <mark>`| +-- functions/`</mark> 16 <mark>`| | +-- github -webhook/`</mark> 17 <mark>`| | +-- github -install/`</mark> 18 <mark>`| | +-- dashboard -api/`</mark> 19 <mark>`| | +-- analysis -callback/`</mark> 20 <mark>`| | +-- generate -fix/`</mark> 21 <mark>`| | +-- github -comment/`</mark> 22 <mark>`| | +-- reviewer -recommendation /`</mark> 23 <mark>`| |`</mark> 24 <mark>`| +-- migrations/`</mark> 25 <mark>`| +-- 0001 _initial.sql`</mark> 26 <mark>`| +-- 0002 _indexes.sql`</mark> 27 <mark>`| +-- 0003 _rls.sql`</mark> 

8 

**PR Sentinel** 

Technical Requirements Document 

|28|`|`||
|---|---|---|
|29|`+-- `|`worker/`|
|30|`|`|`+-- analysis/`|
|31|`|`|`|`<br>`+-- github.py`|
|32|`|`|`|`<br>`+-- diff.py`|
|33|`|`|`|`<br>`+-- parser.py`|
|34|`|`|`|`<br>`+-- security.py`|
|35|`|`|`|`<br>`+-- complexity.py`|
|36|`|`|`|`<br>`+-- context.py`|
|37|`|`|`|`<br>`+-- ai.py`|
|38|`|`|`|`<br>`+-- risk.py`|
|39|`|`|`|`<br>`+-- expertise.py`|
|40|`|`|`|`<br>`+-- reviewer.py`|
|41|`|`|`|`|
|42|`|`|`+-- validation/`|
|43|`|`|`+-- validate_patch .py`|
|44|`|`|`+-- Dockerfile`|
|45|`|`||
|46|`+-- `|`.github/`|
|47|`|`|`+-- workflows/`|
|48|`|`|`+-- analyze -pr.yml`|
|49|`|`|`+-- validate -fix.yml`|
|50|`|`||
|51|`+-- `|`docs/`|
|52|`|`|`+-- architecture/`|
|53|`|`|`+-- api/`|
|54|`|`|`+-- security/`|
|55|`|`||
|56|`+-- `|`package.json`|
|57|`+-- `|`README.md`|



### **7 GitHub Integration** 

#### **7.1 GitHub App** 

PR Sentinel shall use a GitHub App instead of a Personal Access Token. 

The App shall request only the permissions required for the MVP. 

|**Permission**|**Access**|**Purpose**|
|---|---|---|
|Contents|Read|Read repository files and commits|
|Pull Requests|Read/Write|Read PRs and publish findings|
|Metadata|Read|Repository metadata|
|Issues|Read/Write|PR comments where required|
|Checks|Read|Existing CI/check information|
|Commit statuses|Read|Existing validation state|



#### **7.2 Supported Events** 

The MVP shall support: 

- `pull_request.opened` 

- `pull_request.synchronize` 

9 

**PR Sentinel** 

Technical Requirements Document 

- `pull_request.reopened` 

- `pull_request.closed` 

- `pull_request_review.submitted` 

- `push` 

#### **7.3 Webhook Processing** 

The webhook function shall: 

1. Verify the GitHub webhook signature. 

2. Parse the event type. 

3. Reject unsupported events. 

4. Deduplicate the event. 

5. Persist the event. 

6. Create an analysis job. 

7. Trigger or dispatch the analysis workflow. 

8. Return an HTTP response without performing heavy analysis. 

### **8 Data Model** 

#### **8.1 Core Tables** 

The MVP database shall contain at least the following tables: 

|**Table**|**Primary Key**|**Purpose**|
|---|---|---|
|profiles|UUID|Dashboard user profile|
|organizations|UUID|Tenant/organization metadata|
|repositories|UUID|Connected GitHub repositories|
|github_installations|UUID|GitHub App installation metadata|
|pull_requests|UUID|Pull Request metadata|
|webhook_events|UUID|Idempotency and audit records|
|analysis_jobs|UUID|Durable analysis queue|
|analysis_runs|UUID|Individual analysis executions|
|findings|UUID|Structured engineering findings|
|risk_scores|UUID|Deterministic risk calculations|
|developer_signals|UUID|Expertise evidence|
|reviewer_recommendati|onsUUID|Suggested reviewers|
|generated_fixes|UUID|AI-generated patch metadata|
|validation_runs|UUID|Fix validation results|
|audit_logs|UUID|Security and workflow audit trail|



10 

**PR Sentinel** 

Technical Requirements Document 

#### **8.2 Analysis Job State** 

- 1 <mark>`QUEUED`</mark> 

- 2 <mark>`RUNNING`</mark> 

- 3 <mark>`COMPLETED`</mark> 

- 4 <mark>`FAILED`</mark> 

- 5 <mark>`CANCELLED`</mark> 

#### **8.3 Validation State** 

1 <mark>`GENERATED`</mark> 

- 2 <mark>`APPLIED`</mark> 

- 3 <mark>`TESTING`</mark> 

- 4 <mark>`VALIDATED`</mark> 

- 5 <mark>`FAILED`</mark> 

- 6 <mark>`REJECTED`</mark> 

### **9 Database Schema Requirements** 

#### **9.1 Analysis Jobs** 

The `analysis_jobs` table shall contain: 

- 1 <mark>`id UUID PRIMARY KEY`</mark> 2 <mark>`repository_id UUID NOT NULL`</mark> 3 <mark>`pull_request_id UUID NOT NULL`</mark> 

- 4 <mark>`commit_sha TEXT NOT NULL`</mark> 

- 5 <mark>`status TEXT NOT NULL`</mark> 

- 6 <mark>`priority INTEGER NOT NULL DEFAULT 0`</mark> 7 <mark>`attempts INTEGER NOT NULL DEFAULT 0`</mark> 8 <mark>`created_at TIMESTAMPTZ NOT NULL`</mark> 

- 9 <mark>`started_at TIMESTAMPTZ`</mark> 

- 10 <mark>`completed_at TIMESTAMPTZ`</mark> 

- 11 <mark>`error_message TEXT`</mark> 

A uniqueness constraint shall prevent duplicate work for the same repository, Pull Request, commit, and analysis version. 

_Repository_ + _PR_ + _CommitSHA_ + _AnalysisV ersion_ 

#### **9.2 Findings** 

Each finding shall store: 

1 <mark>`id`</mark> 

- 2 <mark>`analysis_run_id`</mark> 3 <mark>`severity`</mark> 

- 4 <mark>`category`</mark> 

- 5 <mark>`title`</mark> 

- 6 <mark>`file_path`</mark> 

- 7 <mark>`line_start`</mark> 

- 8 <mark>`line_end`</mark> 

- 9 <mark>`description`</mark> 

- 10 <mark>`impact`</mark> 

- 11 <mark>`evidence`</mark> 

- 12 <mark>`suggested_fix`</mark> 

- 13 <mark>`confidence`</mark> 

11 

**PR Sentinel** 

Technical Requirements Document 

- 14 <mark>`source`</mark> 

- 15 <mark>`created_at`</mark> 

The `source` field shall distinguish deterministic findings from AI-generated findings. 

### **10 PR Analysis Pipeline** 

#### **10.1 Pipeline Stages** 



<!-- Start of picture text -->
Changed Syntax Static<br>PR Diff<br>Files Analysis Security<br>Relevant Context AI Risk<br>Tests Builder Analysis Engine<br>Structured<br>Analysis Result<br><!-- End of picture text -->

Figure 3: Pull Request Analysis Pipeline 

#### **10.2 Change Extraction** 

The worker shall calculate: 

- Lines added and removed. 

- Files changed. 

- Functions and classes changed. 

- Dependencies changed. 

- Configuration changes. 

- Database changes. 

- API changes. 

- Test changes. 

### **11 Context Construction** 

The complete repository shall not be blindly submitted to an LLM. 

The bounded context shall be: 

_Context_ = _Diff_ + _ChangedFunction_ + _ContainingFile_ + _Dependencies_ + _RelevantTests_ + _HistoricalSignals_ 

The priority order is: 

1. Changed lines. 

12 

**PR Sentinel** 

Technical Requirements Document 

2. Surrounding function or method. 

3. Calling functions. 

4. Imported modules. 

5. Relevant tests. 

6. Relevant configuration. 

7. Relevant historical changes. 

The worker shall enforce hard limits on file count, bytes, and estimated token count. 

### **12 Static Code Intelligence** 

#### **12.1 Tree-sitter** 

Tree-sitter shall provide syntax-aware parsing. 

Initial languages: 

- Python. 

- JavaScript. 

- TypeScript. 

- Java. 

- C++. 

- Go. 

The parser shall extract: 

- Functions. 

- Classes. 

- Methods. 

- Imports. 

- Calls. 

- Variables. 

- Control-flow structures. 

#### **12.2 Semgrep** 

Semgrep shall provide deterministic security checks. 

Initial categories: 

- SQL injection. 

- Command injection. 

- Cross-site scripting. 

13 

**PR Sentinel** 

Technical Requirements Document 

- Hardcoded secrets. 

- Authentication bypass patterns. 

- Authorization weaknesses. 

- Unsafe deserialization. 

- Insecure file operations. 

- Sensitive data exposure. 

#### **12.3 Complexity** 

The system shall calculate: 

- Cyclomatic complexity. 

- Function length. 

- Nesting depth. 

- Dependency count. 

- Change size. 

- Duplicate-code signals where practical. 

### **13 AI Analysis Engine** 

#### **13.1 Provider Abstraction** 

The worker shall use a provider abstraction. 

1 <mark>`class AIProvider:`</mark> 

2 <mark>`def analyze(context: AnalysisContext ) -> list[AIFinding ]:`</mark> 3 <mark>`...`</mark> 

4 

5 <mark>`def generate_fix(`</mark> 6 <mark>`finding: AIFinding ,`</mark> 7 <mark>`context: AnalysisContext`</mark> 8 <mark>`) -> GeneratedPatch :`</mark> 9 <mark>`...`</mark> 

10 

11 <mark>`def generate_brief (`</mark> 12 <mark>`context: ReviewContext`</mark> 13 <mark>`) -> ReviewBrief:`</mark> 14 <mark>`...`</mark> 

The concrete provider can be replaced without changing the analysis pipeline. 

#### **13.2 Provider Modes** 

|**Mode**|**Use**||**Requirement**|
|---|---|---|---|
|Hosted Free Tier|Hackathon|demonstra-|Must operate within provider free|
||tion||quota|



14 

**PR Sentinel** 

Technical Requirements Document 

|Ollama|Local/private<br>develop-|Requires|developer machine with|
|---|---|---|---|
||ment|suitable|model|
|Future Provider|Production migration|Must imp|lement the same interface|



#### **13.3 Structured AI Output** 

The model shall be instructed to return machine-readable JSON. 

1 <mark>`{`</mark> 2 <mark>`"severity ": "critical",`</mark> 3 <mark>`"category ": "security",`</mark> 4 <mark>`"title ": "Potential SQL Injection",`</mark> 5 <mark>`"file ": "auth/service.py",`</mark> 6 <mark>`"line ": 84,`</mark> 7 <mark>`"description ": "..." ,`</mark> 8 <mark>`"impact ": "..." ,`</mark> 9 <mark>`"evidence ": "..." ,`</mark> 10 <mark>`" suggested_fix ": "..." ,`</mark> 11 <mark>`"confidence ": 0.94`</mark> 12 <mark>`}`</mark> 

The application shall validate the response against a schema before persisting it. 

### **14 Risk Engine** 

#### **14.1 Risk Dimensions** 

|**Dimension**|**Signal**|
|---|---|
|Security Impact|Severity of deterministic or AI-supported security<br>finding|
|Business Impact|Authentication, payment, authorization, or criti-<br>cal workflow impact|
|Regression Risk|Potential change to existing behavior|
|Complexity|Increase in code complexity|
|Change Size|Number of changed files and lines|
|Dependency Impact|Core dependency modifications|
|Historical Risk|Prior defects or churn in affected areas|



#### **14.2 Deterministic Score** 

A normalized score shall be calculated from the above dimensions: 

_RiskScore_ = 0 _._ 30 _S_ + 0 _._ 20 _B_ + 0 _._ 15 _R_ + 0 _._ 10 _C_ + 0 _._ 10 _D_ + 0 _._ 10 _H_ + 0 _._ 05 _Z_ 

where each dimension is normalized to the range [0 _,_ 100]. 

The exact weights shall be configurable and versioned. 

AI confidence shall not directly override deterministic risk. 

15 

**PR Sentinel** 

Technical Requirements Document 

### **15 Reviewer Recommendation** 

Reviewer recommendation shall be evidence-based. 

Signals may include: 

- Historical changes to affected files. 

- Commit frequency in affected modules. 

- Previous reviews in the repository. 

- Ownership patterns. 

- Recent contribution activity. 

- Language or module affinity. 

The system shall not infer personal attributes unrelated to repository activity. 

#### **15.1 Recommendation Score** 

For each candidate: 

_ReviewerScore_ = 0 _._ 40 _FileExpertise_ +0 _._ 25 _RecentActivity_ +0 _._ 20 _ReviewHistory_ +0 _._ 15 _ModuleAffinity_ 

The dashboard shall expose the signals supporting the recommendation. 

### **16 Fix Generation** 

Fix generation shall be optional. 

The AI shall produce: 

- Explanation of the proposed change. 

- Unified diff or patch. 

- Expected behavior. 

- Potential side effects. 

Generated patches shall never be merged automatically. 

### **17 Fix Validation** 



<!-- Start of picture text -->
Generated Ephemeral Tests + Security<br>Patch Validation Job Lint Checks<br>Validation Human<br>Result Approval<br><!-- End of picture text -->

Figure 4: AI Fix Validation Pipeline 

16 

**PR Sentinel** 

Technical Requirements Document 

Validation shall occur in an ephemeral environment. 

Recommended Docker restrictions: 

- 1 <mark>`docker run \`</mark> 

- 2 <mark>`--rm \`</mark> 

- 3 <mark>`--network none \`</mark> 

- 4 <mark>`--read -only \`</mark> 

- 5 <mark>`--cap -drop ALL \`</mark> 

- 6 <mark>`--security -opt no -new -privileges \`</mark> 

- 7 <mark>`--memory 1g \`</mark> 

- 8 <mark>`--cpus 1 \`</mark> 

- 9 <mark>`validator -image`</mark> 

The exact sandbox configuration shall be adapted to the language being tested. 

A failed test means: 

_V alidationStatus̸_ = _V ALIDATED_ 

### **18 Dashboard Requirements** 

The React dashboard shall contain: 

- Overview dashboard. 

- Pull Request risk queue. 

- Pull Request detail page. 

- Finding detail panel. 

- Reviewer recommendations. 

- Developer expertise view. 

- Fix generation view. 

- Validation status. 

- Audit trail. 

- Repository risk graph. 

#### **18.1 Code-Risk Graph** 

React Flow shall visualize: 

- Pull Requests. 

- Files. 

- Functions. 

- Classes. 

- Dependencies. 

- APIs. 

- Tests. 

17 

**PR Sentinel** 

Technical Requirements Document 

- External systems. 

Graph nodes may display: 

- Risk score. 

- Findings. 

- Dependencies. 

- Historical changes. 

### **19 Authentication and Authorization** 

Supabase Auth shall provide dashboard authentication. Roles: 

- Developer. 

- Reviewer. 

- Tech Lead. 

- Engineering Manager. 

- Organization Admin. 

Authorization shall use: 

- Supabase Row Level Security. 

- Server-side role checks. 

- Repository membership checks. 

- GitHub installation ownership checks. 

The Supabase service-role key shall never be exposed to the browser. 

### **20 Security Architecture** 

#### **20.1 Application Security** 

The system shall implement: 

- GitHub App authentication. 

- Least-privilege repository permissions. 

- Webhook signature verification. 

- Secure server-side credential storage. 

- Supabase Row Level Security. 

- Input validation. 

- Rate limiting where practical. 

- Audit logging. 

18 

**PR Sentinel** 

Technical Requirements Document 

- Idempotent event handling. 

#### **20.2 Secret Management** 

Secrets shall never be: 

- Stored in source code. 

- Sent to the frontend. 

- Included in AI prompts unnecessarily. 

- Printed in logs. 

- Persisted as plaintext unless technically unavoidable. 

Required secret classes include: 

- 1 <mark>`SUPABASE_SERVICE_ROLE_KEY`</mark> 

- 2 

- 3 <mark>`GITHUB_APP_ID`</mark> 

- 4 <mark>`GITHUB_APP_PRIVATE_KEY`</mark> 

- 5 <mark>`GITHUB_WEBHOOK_SECRET`</mark> 

- 6 

- 7 <mark>`AI_PROVIDER_KEY`</mark> 

- 8 

- 9 <mark>`ANALYSIS_CALLBACK_SECRET`</mark> 

#### **20.3 AI Security** 

Repository content is untrusted input. 

The system shall separate: 

_RepositoryData̸_ = _SystemInstructions_ 

The AI must defend against: 

- Prompt injection. 

- Malicious README instructions. 

- Malicious comments. 

- Data exfiltration attempts. 

- Secret exposure. 

- Malicious generated patches. 

The AI provider shall not receive unrestricted tool access. 

### **21 Caching and Idempotency** 

#### **21.1 Browser Cache** 

The dashboard shall use TanStack Query for client-side caching. 

19 

**PR Sentinel** 

Technical Requirements Document 

#### **21.2 Analysis Cache** 

An analysis result may be reused when: 

_Repository_ + _PR_ + _CommitSHA_ + _AnalysisV ersion_ 

remain unchanged. 

This prevents repeated AI calls for identical commits. 

#### **21.3 Webhook Idempotency** 

Every GitHub webhook delivery contains a delivery identifier. 

The system shall persist this identifier in: 

```
webhook_events
```

with a unique constraint. 

Duplicate deliveries shall return successfully without creating duplicate analysis jobs. 

### **22 API Requirements** 

#### **22.1 Publicly Reachable Endpoints** 

The following logical endpoints shall exist: 

|**Endpoint**|**Method**|**Purpose**|
|---|---|---|
|/github/webhook|POST|Receive GitHub events|
|/github/install|POST|Register installation metadata|
|/analysis/callback|POST|Receive worker completion|
|/analysis/id|GET|Retrieve analysis result|
|/prs|GET|List Pull Requests|
|/prs/id|GET|Retrieve PR details|
|/findings/id|GET|Retrieve finding details|
|/reviewers/pr|GET|Retrieve recommendations|
|/fixes|POST|Request fix generation|
|/validation/id|GET|Retrieve validation status|



All sensitive endpoints shall require authentication or an internal callback secret. 

### **23 Performance Requirements** 

The prototype targets are: 

|**PR Size**|**Target**|**Execution Model**|
|---|---|---|
|Small|_<_30 seconds|Static analysis + bounded AI con-<br>text|
|Medium|_<_90 seconds|Asynchronous worker|



20 

**PR Sentinel** 

Technical Requirements Document 

Large _<_ 3 minutes Asynchronous worker + bounded context 

Webhook processing shall return quickly and shall never wait for the complete analysis pipeline. 

### **24 Observability** 

Every analysis shall receive a unique: 

_analysis_  run_  id_ 

The following events shall be logged: 

- Webhook received. 

- Analysis job created. 

- Analysis started. 

- Analysis completed. 

- AI request duration. 

- Finding count. 

- Risk calculation. 

- Fix generation. 

- Validation result. 

- API errors. 

Sensitive source code and secrets shall not be written to application logs. 

### **25 Failure Handling** 

The system shall gracefully handle: 

- GitHub API failure. 

- Duplicate webhook delivery. 

- AI provider timeout. 

- AI rate limiting. 

- Worker failure. 

- Database failure. 

- Invalid AI JSON. 

- Invalid generated patch. 

- Test failure. 

- Security scan failure. 

21 

**PR Sentinel** 

Technical Requirements Document 

An AI failure must not delete or invalidate the underlying Pull Request. 

The dashboard should expose: 

1 <mark>`Analysis unavailable`</mark> 

2 

3 <mark>`Reason:`</mark> 

- 4 <mark>`AI provider timeout`</mark> 5 

6 <mark>`Action:`</mark> 

- 7 <mark>`Retry analysis`</mark> 

### **26 Testing Strategy** 

#### **26.1 Unit Tests** 

Unit tests shall cover: 

- Risk calculations. 

- Priority calculations. 

- Reviewer recommendation. 

- Context construction. 

- Diff extraction. 

- Finding validation. 

- Security rules. 

- Webhook signature validation. 

- Idempotency. 

#### **26.2 Integration Tests** 

Integration tests shall cover: 

- GitHub webhook to job creation. 

- Job creation to GitHub Actions. 

- Worker to Supabase. 

- Worker to AI provider. 

- Analysis to GitHub comment. 

- Fix generation to validation. 

#### **26.3 End-to-End Test** 

The E2E scenario shall simulate: 

1. Open a Pull Request. 

2. Receive webhook. 

3. Create analysis job. 

22 

**PR Sentinel** 

Technical Requirements Document 

4. Run analysis. 

5. Calculate risk. 

6. Update dashboard. 

7. Publish GitHub comment. 

8. Generate a fix. 

9. Validate the fix. 

10. Present result for human approval. 

### **27 Deployment Procedure** 

#### **27.1 Step 1 – Supabase** 

Create a Supabase project and configure: 

- PostgreSQL. 

- Authentication. 

- Storage if required. 

- Row Level Security. 

- Edge Functions. 

Apply database migrations: 

1 <mark>`supabase db push`</mark> 

Deploy Edge Functions: 

|1|`supabase`|`functions`|`deploy `|`github -webhook`|
|---|---|---|---|---|
|2|`supabase`|`functions`|`deploy `|`github -install`|
|3|`supabase`|`functions`|`deploy`|`dashboard -api`|
|4|`supabase`|`functions`|`deploy`|`analysis -callback`|
|5|`supabase`|`functions`|`deploy`|`generate -fix`|
|6|`supabase`|`functions`|`deploy `|`github -comment`|



#### **27.2 Step 2 – Cloudflare Pages** 

Build: 

|1<br>`npm`|`install`|
|---|---|
|2<br>`npm `|`run build`|



Deploy the `dist/` directory. 

#### **27.3 Step 3 – GitHub App** 

Create a GitHub App and configure: 

- App name. 

- Homepage URL. 

23 

**PR Sentinel** 

Technical Requirements Document 

- Webhook URL. 

- Webhook secret. 

- Repository permissions. 

- Pull Request events. 

- Push events. 

Install the App only on repositories that require analysis. 

#### **27.4 Step 4 – GitHub Actions** 

The repository shall contain: 

1 <mark>`.github/workflows/analyze -pr.yml`</mark> 

- 2 <mark>`.github/workflows/validate -fix.yml`</mark> 

The workflows shall receive only the minimum required secrets. 

#### **27.5 Step 5 – Environment Variables** 

Backend: 

- 1 <mark>`SUPABASE_URL`</mark> 

- 2 <mark>`SUPABASE_SERVICE_ROLE_KEY`</mark> 

3 

- 4 <mark>`GITHUB_APP_ID`</mark> 

- 5 <mark>`GITHUB_APP_PRIVATE_KEY`</mark> 

- 6 <mark>`GITHUB_WEBHOOK_SECRET`</mark> 

- 7 

- 8 <mark>`AI_PROVIDER`</mark> 

- 9 <mark>`AI_PROVIDER_KEY`</mark> 

- 10 

- 11 <mark>`ANALYSIS_CALLBACK_SECRET`</mark> 

Frontend: 

- 1 <mark>`VITE_SUPABASE_URL`</mark> 

- 2 <mark>`VITE_SUPABASE_ANON_KEY`</mark> 

The following must never be exposed to the frontend: 

- 1 <mark>`SUPABASE_SERVICE_ROLE_KEY`</mark> 

- 2 <mark>`GITHUB_APP_PRIVATE_KEY`</mark> 

- 3 <mark>`GITHUB_WEBHOOK_SECRET`</mark> 

- 4 <mark>`AI_PROVIDER_KEY`</mark> 

- 5 <mark>`ANALYSIS_CALLBACK_SECRET`</mark> 

24 

**PR Sentinel** 

Technical Requirements Document 

### **28 CI/CD Workflow** 



<!-- Start of picture text -->
GitHub Analysis<br>Pull Request Supabase<br>Workflow Worker<br>Validation Test + Human<br>Workflow Security Approval<br><!-- End of picture text -->

Figure 5: CI/CD and Asynchronous Analysis Flow 

### **29 Free-Tier Operational Limits** 

The architecture must be quota-aware. 

#### **29.1 Supabase** 

The application shall: 

- Avoid polling at high frequency. 

- Paginate dashboard queries. 

- Store only necessary analysis artifacts. 

- Avoid excessive Edge Function invocations. 

- Use indexes for common queries. 

- Archive or delete disposable artifacts. 

#### **29.2 Cloudflare Pages** 

The frontend shall remain a static build so that no always-on backend instance is required. 

#### **29.3 GitHub Actions** 

The analysis workflow shall: 

- Trigger only for supported PR events. 

- Skip irrelevant file changes when possible. 

- Limit concurrency per repository. 

- Cancel stale runs when a newer commit arrives. 

#### **29.4 AI Provider** 

The system shall: 

- Cache identical analysis results. 

- Bound prompt size. 

- Avoid sending the complete repository. 

25 

**PR Sentinel** 

Technical Requirements Document 

- Retry only transient errors. 

- Stop retrying after a bounded number of attempts. 

- Fall back to deterministic analysis if AI is unavailable. 

### **30 Threat Model** 

The following assets require protection: 

- GitHub credentials. 

- Repository source code. 

- User identity information. 

- Analysis results. 

- AI credentials. 

- Generated patches. 

Primary threats: 

|**Threat**|**Impact**|**Mitigation**|
|---|---|---|
|Webhook spoofing|Fake analysis jobs|Signature verification|
|Credential leakage|Repository compromise|Server-side secret stor-<br>age|
|Prompt injection|Incorrect AI behavior|Explicit<br>data/instruction separa-<br>tion|
|Malicious patch|Code execution|Isolated validation|
|Duplicate webhook|Duplicate analysis|Delivery-id idempotency|
|Unauthorized dashboard|Data exposure|Auth + RLS|
|access|||
|AI outage|Missing AI findings|Deterministic fallback|
|Repository exfiltration|Source leakage|Bounded context|



### **31 Non-Functional Requirements** 

#### **31.1 Availability** 

The dashboard should remain usable even if the AI provider is temporarily unavailable. 

#### **31.2 Security** 

No secret shall be delivered to browser JavaScript. 

#### **31.3 Maintainability** 

Provider-specific integrations shall be isolated behind interfaces. 

26 

**PR Sentinel** 

Technical Requirements Document 

#### **31.4 Scalability** 

The MVP shall scale horizontally by increasing the number of ephemeral GitHub Actions jobs rather than adding a permanent worker server. 

#### **31.5 Cost** 

The baseline architecture shall not require a paid cloud subscription or temporary promotional credits for the MVP. 

### **32 Technical Non-Goals** 

The MVP shall not: 

- Automatically merge Pull Requests. 

- Automatically deploy generated fixes. 

- Replace human approval. 

- Guarantee bug-free code. 

- Function as a complete CI/CD platform. 

- Replace GitHub. 

- Make employment or performance judgments. 

- Require an always-on backend VM. 

- Require Redis. 

### **33 Future Extensions** 

Future versions may add: 

- Additional AI providers. 

- Organization-level analytics. 

- Historical risk trends. 

- Advanced dependency graphs. 

- More programming languages. 

- Enterprise identity providers. 

- Dedicated worker infrastructure. 

- SFU-style distributed analysis workers. 

- Automated patch PR creation. 

Automatic production deployment remains outside the MVP scope. 

27 

**PR Sentinel** 

Technical Requirements Document 

### **34 Final Architecture** 

The final architecture is intentionally compact: 



<!-- Start of picture text -->
Supabase Edge Supabase Cloudflare Pages<br>GitHub<br>Webhook PostgreSQL Dashboard<br>GitHub Actions GitHub Actions AI Provider<br>Analysis Worker Validation Abstraction<br><!-- End of picture text -->

Figure 6: Final PR Sentinel Architecture 

The final flow is: 

### **GitHub Event** _→_ **Webhook** _→_ **PostgreSQL Job** _→_ **GitHub Actions** _→_ **Static Analysis** _→_ **AI Analysis** _→_ **Risk** _→_ **Fix** _→_ **Validation** _→_ **Human Approval** 

The principal architectural decision is to keep HTTP-facing services lightweight and move expensive computation into ephemeral GitHub Actions workers. PostgreSQL provides durable state, Supabase provides managed application services, Cloudflare Pages provides static frontend hosting, and the AI layer remains replaceable. 

### **35 Conclusion** 

PR Sentinel can be implemented as a serverless, event-driven engineering risk platform without depending on paid infrastructure or temporary cloud credits. 

The architecture minimizes operational complexity by using: 

- Supabase for database, authentication, storage, and lightweight APIs. 

- Cloudflare Pages for static frontend hosting. 

- GitHub Actions for ephemeral analysis and validation compute. 

- GitHub Apps and Webhooks for secure repository integration. 

- Tree-sitter and Semgrep for deterministic code intelligence. 

- A replaceable AI provider layer for AI-assisted analysis. 

The resulting MVP remains deployable with a small operational footprint while preserving clear boundaries for future migration to dedicated infrastructure. 

28 

