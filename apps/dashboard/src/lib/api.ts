import type { PullRequest, Finding, ReviewerRecommendation } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://nhcckvsorfahlpjhiaeg.supabase.co/functions/v1";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const headers = {
  "Content-Type": "application/json",
  ...(SUPABASE_ANON_KEY ? { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
};

export async function fetchPullRequests(): Promise<PullRequest[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard-api/prs`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch PRs: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to fetch live pull requests, using fallback:", err);
    return [];
  }
}

export interface PRDetailsResponse {
  pr: PullRequest;
  findings: Finding[];
  reviewers: ReviewerRecommendation[];
}

export async function fetchPRDetails(prIdOrNumber: string | number): Promise<PRDetailsResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard-api/prs/${prIdOrNumber}`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch PR details: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Failed to fetch PR ${prIdOrNumber} details:`, err);
    return null;
  }
}

export interface SystemStats {
  stats: {
    total_prs: number;
    total_jobs: number;
    total_findings: number;
    total_fixes: number;
  };
  recent_prs: Array<{
    id: string;
    number: number;
    title: string;
    state: string;
    risk_score: number;
    risk_level: string;
    created_at: string;
    head_branch: string;
    repositories?: { name: string };
  }>;
}

export async function fetchSystemStats(): Promise<SystemStats | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard-api/stats`, {
      method: "GET",
      headers,
    });
    if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn("Failed to fetch live system stats:", err);
    return null;
  }
}

export async function triggerReanalysis(prIdOrNumber: string | number): Promise<{ success: boolean; job_id?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard-api/prs/${prIdOrNumber}/analyze`, {
      method: "POST",
      headers,
    });
    if (!res.ok) throw new Error("Failed to trigger re-analysis");
    const data = await res.json();
    return { success: true, job_id: data.job_id };
  } catch (err) {
    console.warn("Error triggering reanalysis:", err);
    return { success: false };
  }
}

export async function postGitHubComment(pullRequestId: string, commentBody?: string): Promise<{ success: boolean; comment_id?: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/github-comment`, {
      method: "POST",
      headers,
      body: JSON.stringify({ pull_request_id: pullRequestId, comment_body: commentBody }),
    });
    if (!res.ok) throw new Error("Failed to post comment");
    const data = await res.json();
    return { success: true, comment_id: data.comment_id };
  } catch (err) {
    console.warn("Error posting GitHub comment:", err);
    return { success: false };
  }
}

export async function approvePatch(prId: string, findingId: string): Promise<{ success: boolean; comment_id?: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard-api/prs/${prId}/findings/${findingId}/approve`, {
      method: "POST",
      headers,
    });
    if (!res.ok) throw new Error("Failed to post patch suggestion");
    const data = await res.json();
    return { success: true, comment_id: data.comment_id };
  } catch (err) {
    console.warn("Error posting patch suggestion:", err);
    return { success: false };
  }
}

