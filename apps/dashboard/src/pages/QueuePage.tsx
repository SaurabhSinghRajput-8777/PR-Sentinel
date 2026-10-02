import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowUpRight, 
  GitBranch, 
  Sparkles,
  Layers
} from "lucide-react";
import type { PullRequest } from "../types";
import { formatRelativeTime } from "../lib/utils";

// Mock data demonstrating the PR Sentinel Canonical Schema
const MOCK_PULL_REQUESTS: PullRequest[] = [
  {
    id: "pr-184",
    repository_id: "repo-1",
    github_pr_id: 10184,
    number: 184,
    title: "refactor(auth): migrate token rotation and session caching to async store",
    author_login: "alexchen",
    base_branch: "main",
    head_branch: "feat/auth-session-cache",
    head_commit_sha: "e8f39b1",
    state: "open",
    risk_score: 84,
    risk_level: "CRITICAL",
    priority_score: 95,
    additions: 412,
    deletions: 189,
    changed_files_count: 14,
    github_created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    github_updated_at: new Date(Date.now() - 1800000).toISOString(),
    review_brief: {
      summary: "High blast radius change affecting auth token generation and Redis connection pooling fallback.",
      key_risks: [
        "Unbounded retry loop in auth token exchange if Redis connection drops",
        "Potential race condition during concurrent refresh token revoking",
        "Missing test coverage in fallback memory cache layer"
      ],
      testing_recommendations: [
        "Execute chaos test simulating 2s Redis network partition",
        "Validate backward compatibility with v1 JWT claims"
      ],
      impact_surface: ["src/auth/jwt.ts", "src/auth/session.ts", "src/middleware/guard.ts"]
    }
  },
  {
    id: "pr-183",
    repository_id: "repo-1",
    github_pr_id: 10183,
    number: 183,
    title: "feat(billing): implement webhook idempotency key validation",
    author_login: "sarah-m",
    base_branch: "main",
    head_branch: "feat/stripe-webhook-idempotency",
    head_commit_sha: "71c04d2",
    state: "open",
    risk_score: 62,
    risk_level: "HIGH",
    priority_score: 72,
    additions: 128,
    deletions: 34,
    changed_files_count: 5,
    github_created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    github_updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    review_brief: {
      summary: "Adds Postgres lock on webhook delivery ID with 24h expiration.",
      key_risks: ["Deadlock potential under high burst webhook traffic"],
      testing_recommendations: ["Concurrency test with 50 parallel identical requests"],
      impact_surface: ["src/billing/stripe.ts", "supabase/migrations/0004_billing.sql"]
    }
  },
  {
    id: "pr-182",
    repository_id: "repo-1",
    github_pr_id: 10182,
    number: 182,
    title: "chore(deps): update tree-sitter bindings and semgrep rule definitions",
    author_login: "dependabot[bot]",
    base_branch: "main",
    head_branch: "deps/tree-sitter-upgrade",
    head_commit_sha: "a310c8f",
    state: "open",
    risk_score: 18,
    risk_level: "LOW",
    priority_score: 20,
    additions: 45,
    deletions: 42,
    changed_files_count: 2,
    github_created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    github_updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  }
];

export const QueuePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f5f0] pb-24">
      {/* Top Banner / Editorial Tagline */}
      <section className="border-b border-[#262626] bg-[#0d0d0d] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-[#d8ff3e] uppercase tracking-wider mb-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#d8ff3e] animate-ping" />
                <span>Engineering Queue Triage</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f5f5f0]">
                Don’t review every PR. <br className="hidden sm:inline" />
                <span className="text-[#a5a5a0]">Review the PRs that matter.</span>
              </h1>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 border-t sm:border-t-0 sm:border-l border-[#262626] sm:pl-8 pt-4 sm:pt-0">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-[#686863]">CRITICAL PRs</span>
                <span className="text-2xl font-mono font-bold text-[#ff4d4d]">1</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono text-[#686863]">AVG RISK</span>
                <span className="text-2xl font-mono font-bold text-[#d8ff3e]">54.6</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono text-[#686863]">FIXES PROPOSED</span>
                <span className="text-2xl font-mono font-bold text-[#38bdf8]">2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main PR Risk Surface Queue */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Layers className="h-4 w-4 text-[#d8ff3e]" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-[#a5a5a0]">
              Active Pull Request Risk Surfaces ({MOCK_PULL_REQUESTS.length})
            </h2>
          </div>
          <div className="text-xs font-mono text-[#686863]">
            Sorted by Deterministic Priority Score
          </div>
        </div>

        <div className="space-y-4">
          {MOCK_PULL_REQUESTS.map((pr) => {
            const isCritical = pr.risk_level === "CRITICAL";
            const isHigh = pr.risk_level === "HIGH";

            return (
              <div
                key={pr.id}
                className="group relative rounded-sm border border-[#262626] bg-[#121212] p-5 transition-all hover:border-[#383838] hover:bg-[#151515]"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left: PR Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-[#d8ff3e]">#{pr.number}</span>
                      <span className="text-[#686863]">·</span>
                      <span className="text-[#a5a5a0]">by @{pr.author_login}</span>
                      <span className="text-[#686863]">·</span>
                      <span className="flex items-center text-[#686863]">
                        <GitBranch className="h-3 w-3 mr-1" />
                        {pr.head_branch}
                      </span>
                      <span className="text-[#686863]">·</span>
                      <span className="text-[#686863]">{formatRelativeTime(pr.github_updated_at)}</span>
                    </div>

                    <Link
                      to={`/pr/${pr.number}`}
                      className="inline-flex items-center space-x-1.5 text-base font-semibold text-[#f5f5f0] group-hover:text-[#d8ff3e] transition-colors"
                    >
                      <span>{pr.title}</span>
                      <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    {/* AI Brief Extract if exists */}
                    {pr.review_brief && (
                      <div className="rounded border border-[#262626] bg-[#0a0a0a] p-3 text-xs">
                        <div className="flex items-center space-x-1.5 text-[#38bdf8] font-mono text-[11px] mb-1">
                          <Sparkles className="h-3 w-3" />
                          <span>AI REVIEW BRIEF FOCUS</span>
                        </div>
                        <p className="text-[#a5a5a0] line-clamp-2">
                          {pr.review_brief.summary}
                        </p>
                      </div>
                    )}

                    {/* Stats & Meta */}
                    <div className="flex items-center space-x-4 text-xs font-mono text-[#686863]">
                      <span>+{pr.additions} / -{pr.deletions}</span>
                      <span>{pr.changed_files_count} files changed</span>
                      <span className="text-[#a5a5a0]">SHA: {pr.head_commit_sha}</span>
                    </div>
                  </div>

                  {/* Right: Risk Cockpit Score */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 border-[#262626] pt-3 lg:pt-0">
                    <div className="flex flex-col lg:items-end">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-[#686863]">
                        RISK SCORE
                      </span>
                      <div className="flex items-baseline space-x-1">
                        <span
                          className={`text-3xl font-mono font-bold ${
                            isCritical
                              ? "text-[#ff4d4d]"
                              : isHigh
                              ? "text-[#f97316]"
                              : "text-[#38bdf8]"
                          }`}
                        >
                          {pr.risk_score}
                        </span>
                        <span className="text-xs font-mono text-[#686863]">/100</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                          isCritical
                            ? "bg-red-500/10 text-red-400 border border-red-500/30"
                            : isHigh
                            ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                            : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                        }`}
                      >
                        {pr.risk_level} RISK
                      </span>

                      <Link
                        to={`/pr/${pr.number}`}
                        className="px-3 py-1 bg-[#181818] hover:bg-[#202020] text-xs font-mono text-[#f5f5f0] border border-[#262626] rounded transition-colors"
                      >
                        Inspect →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
