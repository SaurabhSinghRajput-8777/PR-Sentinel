-- ==============================================================================
-- PR Sentinel — 0002_indexes.sql
-- Queue retrieval, lookup, and analytical performance indexes
-- ==============================================================================

-- 1. Analysis Jobs Queue Retrieval Index (status + priority + created_at)
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_queue 
ON analysis_jobs (status, priority DESC, created_at ASC) 
WHERE status = 'QUEUED';

-- 2. Analysis Jobs by Repo & PR
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_repo_pr 
ON analysis_jobs (repository_id, pull_request_id);

-- 3. Pull Requests by Repository & Risk
CREATE INDEX IF NOT EXISTS idx_pull_requests_repo_risk 
ON pull_requests (repository_id, risk_score DESC, github_updated_at DESC);

-- 4. Pull Requests by State
CREATE INDEX IF NOT EXISTS idx_pull_requests_state 
ON pull_requests (state);

-- 5. Findings by PR and Severity
CREATE INDEX IF NOT EXISTS idx_findings_pr_severity 
ON findings (pull_request_id, severity);

-- 6. Findings by Category
CREATE INDEX IF NOT EXISTS idx_findings_category 
ON findings (category);

-- 7. Developer Signals Lookup
CREATE INDEX IF NOT EXISTS idx_dev_signals_lookup 
ON developer_signals (repository_id, file_path, commit_count DESC);

-- 8. Audit Logs by PR
CREATE INDEX IF NOT EXISTS idx_audit_logs_pr 
ON audit_logs (pull_request_id, created_at DESC);

-- 9. Webhook Events Lookup
CREATE INDEX IF NOT EXISTS idx_webhook_events_delivery 
ON webhook_events (delivery_id);
