export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FindingCategory = 'SECURITY' | 'BUG' | 'REGRESSION' | 'COMPLEXITY' | 'TEST';
export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ValidationStatus = 'NONE' | 'PENDING' | 'RUNNING' | 'VALIDATED' | 'FAILED';
export type FixStatus = 'GENERATED' | 'APPLIED' | 'TESTING' | 'VALIDATED' | 'FAILED' | 'REJECTED';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id?: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'tech_lead' | 'developer' | 'reviewer';
  created_at?: string;
  updated_at?: string;
}

export interface GitHubInstallation {
  id: string;
  organization_id?: string;
  installation_id: number;
  account_login: string;
  account_type: string;
  permissions: Record<string, string>;
  is_active: boolean;
  installed_at?: string;
  updated_at?: string;
}

export interface Repository {
  id: string;
  installation_id?: string;
  github_repo_id: number;
  owner: string;
  name: string;
  full_name: string;
  default_branch: string;
  is_private: boolean;
  settings?: {
    risk_threshold: number;
    auto_brief_enabled: boolean;
    max_pr_files: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface WebhookEvent {
  id: string;
  delivery_id: string;
  event_type: string;
  action?: string;
  payload: Record<string, any>;
  processed_at?: string;
  status: 'RECEIVED' | 'PROCESSED' | 'IGNORED' | 'FAILED';
  error_message?: string;
  created_at?: string;
}

export interface PullRequest {
  id: string;
  repository_id: string;
  github_pr_id: number;
  number: number;
  title: string;
  author_login: string;
  author_avatar_url?: string;
  base_branch: string;
  head_branch: string;
  head_commit_sha: string;
  state: 'open' | 'closed' | 'merged';
  risk_score: number;
  risk_level: RiskLevel;
  priority_score: number;
  review_brief?: {
    summary: string;
    key_risks: string[];
    testing_recommendations: string[];
    impact_surface: string[];
  };
  additions: number;
  deletions: number;
  changed_files_count: number;
  github_created_at: string;
  github_updated_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnalysisJob {
  id: string;
  repository_id: string;
  pull_request_id: string;
  commit_sha: string;
  analysis_version: string;
  status: JobStatus;
  priority: number;
  attempts: number;
  max_attempts: number;
  error_message?: string;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
}

export interface AnalysisRun {
  id: string;
  job_id?: string;
  pull_request_id: string;
  commit_sha: string;
  risk_score: number;
  risk_level: RiskLevel;
  scoring_breakdown: Record<string, number>;
  raw_static_output?: Record<string, any>;
  raw_ai_output?: Record<string, any>;
  duration_ms?: number;
  created_at?: string;
}

export interface Finding {
  id: string;
  analysis_run_id: string;
  pull_request_id: string;
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  explanation: string;
  file_path: string;
  line_start: number;
  line_end: number;
  impact: string;
  evidence: string;
  proposed_fix?: string;
  confidence: number;
  source: 'deterministic' | 'ai';
  validation_status: ValidationStatus;
  is_dismissed: boolean;
  created_at?: string;
}

export interface DeveloperSignal {
  id: string;
  repository_id: string;
  developer_login: string;
  file_path: string;
  commit_count: number;
  last_commit_at?: string;
  review_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewerRecommendation {
  id: string;
  pull_request_id: string;
  recommended_login: string;
  avatar_url?: string;
  score: number;
  match_reasons: string[];
  is_assigned: boolean;
  created_at?: string;
}

export interface GeneratedFix {
  id: string;
  finding_id: string;
  pull_request_id: string;
  file_path: string;
  diff_patch: string;
  explanation: string;
  status: FixStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ValidationRun {
  id: string;
  fix_id: string;
  runner_type: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  test_output?: string;
  lint_output?: string;
  duration_ms?: number;
  created_at?: string;
  completed_at?: string;
}

export interface AuditLog {
  id: string;
  repository_id?: string;
  pull_request_id?: string;
  actor_id?: string;
  actor_name: string;
  action: string;
  details: Record<string, any>;
  created_at?: string;
}
