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
