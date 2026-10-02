export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FindingCategory = 'SECURITY' | 'BUG' | 'REGRESSION' | 'COMPLEXITY' | 'TEST';

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
  validation_status: 'NONE' | 'PENDING' | 'VALIDATED' | 'FAILED';
  is_dismissed: boolean;
  created_at: string;
}

export interface ReviewerRecommendation {
  id: string;
  pull_request_id: string;
  recommended_login: string;
  avatar_url?: string;
  score: number;
  match_reasons: string[];
  is_assigned: boolean;
}

export interface Repository {
  id: string;
  github_repo_id: number;
  owner: string;
  name: string;
  full_name: string;
  default_branch: string;
  is_private: boolean;
}
