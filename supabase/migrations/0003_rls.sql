-- ==============================================================================
-- PR Sentinel — 0003_rls.sql
-- Row Level Security (RLS) policies for Multi-Tenant Isolation
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Helper function: get user organization ID
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auth_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- Profiles
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view profiles in their organization"
ON profiles FOR SELECT
TO authenticated
USING (organization_id = auth_user_org_id() OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- ------------------------------------------------------------------------------
-- Repositories
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view repositories belonging to their organization"
ON repositories FOR SELECT
TO authenticated
USING (
  installation_id IN (
    SELECT id FROM github_installations WHERE organization_id = auth_user_org_id()
  )
);

-- ------------------------------------------------------------------------------
-- Pull Requests
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view pull requests in accessible repositories"
ON pull_requests FOR SELECT
TO authenticated
USING (
  repository_id IN (
    SELECT r.id FROM repositories r
    JOIN github_installations gi ON r.installation_id = gi.id
    WHERE gi.organization_id = auth_user_org_id()
  )
);

-- ------------------------------------------------------------------------------
-- Findings
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view findings for accessible pull requests"
ON findings FOR SELECT
TO authenticated
USING (
  pull_request_id IN (
    SELECT pr.id FROM pull_requests pr
    JOIN repositories r ON pr.repository_id = r.id
    JOIN github_installations gi ON r.installation_id = gi.id
    WHERE gi.organization_id = auth_user_org_id()
  )
);

-- ------------------------------------------------------------------------------
-- Analysis Runs and Jobs
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view analysis runs for accessible pull requests"
ON analysis_runs FOR SELECT
TO authenticated
USING (
  pull_request_id IN (
    SELECT pr.id FROM pull_requests pr
    JOIN repositories r ON pr.repository_id = r.id
    JOIN github_installations gi ON r.installation_id = gi.id
    WHERE gi.organization_id = auth_user_org_id()
  )
);

-- ------------------------------------------------------------------------------
-- Generated Fixes and Validation Runs
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view generated fixes"
ON generated_fixes FOR SELECT
TO authenticated
USING (
  pull_request_id IN (
    SELECT pr.id FROM pull_requests pr
    JOIN repositories r ON pr.repository_id = r.id
    JOIN github_installations gi ON r.installation_id = gi.id
    WHERE gi.organization_id = auth_user_org_id()
  )
);

CREATE POLICY "Users can view validation runs"
ON validation_runs FOR SELECT
TO authenticated
USING (
  fix_id IN (
    SELECT gf.id FROM generated_fixes gf
    JOIN pull_requests pr ON gf.pull_request_id = pr.id
    JOIN repositories r ON pr.repository_id = r.id
    JOIN github_installations gi ON r.installation_id = gi.id
    WHERE gi.organization_id = auth_user_org_id()
  )
);

-- ------------------------------------------------------------------------------
-- Service Role Bypass (For Edge Functions and Workers)
-- ------------------------------------------------------------------------------
-- Note: Supabase service_role key automatically bypasses RLS by default.
