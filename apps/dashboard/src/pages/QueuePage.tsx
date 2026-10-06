import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowUpRight, 
  GitBranch, 
  Sparkles,
  Layers,
  Search,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import type { PullRequest } from "../types";
import { formatRelativeTime } from "../lib/utils";
import { fetchPullRequests } from "../lib/api";

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
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(MOCK_PULL_REQUESTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadPRs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPullRequests();
      if (data && data.length > 0) {
        setPullRequests(data);
        setIsLive(true);
      } else {
        setPullRequests(MOCK_PULL_REQUESTS);
        setIsLive(false);
      }
    } catch {
      setPullRequests(MOCK_PULL_REQUESTS);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPRs();
  }, []);

  const filteredPRs = pullRequests.filter(pr => {
    if (filterSeverity !== "ALL" && pr.risk_level !== filterSeverity) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        pr.title.toLowerCase().includes(q) ||
        pr.author_login.toLowerCase().includes(q) ||
        pr.number.toString().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#efece6] text-[#111111] pb-24 selection:bg-[#e63920] selection:text-white">
      {/* Editorial Architectural Hero Statement Banner */}
      <section className="relative border-b border-[#d4d0c7] bg-[#efece6] bg-grid-pattern px-6 sm:px-12 lg:px-20 xl:px-28 py-12 lg:py-16 min-h-[340px] flex items-center overflow-hidden">
        {/* Constructivist Accent Geometry in Background */}
        <div className="absolute right-12 top-6 w-36 h-36 rounded-full bg-[#e63920] opacity-90 hidden lg:block pointer-events-none" />
        <div className="absolute right-36 top-16 w-24 h-24 bg-[#111111] opacity-90 hidden lg:block pointer-events-none" />

        <div className="w-full relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-[#111111] text-[11px] font-mono text-[#f7f5f0] uppercase tracking-wider mb-5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e63920] animate-pulse" />
                <span>TRIAGE RECONNAISSANCE // HUMAN-IN-THE-LOOP</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#111111] leading-[1.05] uppercase">
                <div>ENGINEERING RISK,</div>
                <div className="text-[#666660] font-normal">BEFORE IT BECOMES INCIDENT.</div>
              </h1>
              
              <p className="mt-5 text-sm sm:text-base text-[#444440] max-w-2xl leading-relaxed font-sans">
                PR Sentinel continuously decomposes pull requests into AST blast radii, computes deterministic risk scores, synthesizes isolated validation sandboxes, and orchestrates domain-expert review routing.
              </p>
            </div>

            {/* Asymmetrical Editorial Metric Blocks - Architectural Drafting Grid */}
            <div className="flex flex-wrap sm:flex-nowrap gap-0 bg-[#d4d0c7] p-px border border-[#111111] shadow-sm">
              <div className="flex flex-col bg-[#f7f5f0] px-6 py-5 min-w-[130px] border-r border-[#d4d0c7]">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#666660]">
                  MAX RISK
                </span>
                <span className="text-3xl font-mono font-extrabold text-[#e63920] tracking-tight mt-1">
                  84<span className="text-xs font-normal text-[#666660]">/100</span>
                </span>
                <span className="text-[10px] font-mono text-[#e63920] mt-1 uppercase font-bold">
                  ● Critical Blast
                </span>
              </div>

              <div className="flex flex-col bg-[#f7f5f0] px-6 py-5 min-w-[130px] border-r border-[#d4d0c7]">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#666660]">
                  ANALYSIS SLA
                </span>
                <span className="text-3xl font-mono font-extrabold text-[#111111] tracking-tight mt-1">
                  24<span className="text-xs font-normal text-[#666660]">s</span>
                </span>
                <span className="text-[10px] font-mono text-[#666660] mt-1 uppercase">
                  Ephemeral Runner
                </span>
              </div>

              <div className="flex flex-col bg-[#f7f5f0] px-6 py-5 min-w-[130px]">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#666660]">
                  AUTO-PATCHES
                </span>
                <span className="text-3xl font-mono font-extrabold text-[#111111] tracking-tight mt-1">
                  2<span className="text-xs font-normal text-[#e63920] font-bold"> READY</span>
                </span>
                <span className="text-[10px] font-mono text-[#e63920] mt-1 uppercase font-semibold">
                  Sandbox Tested
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Operational Queue Control Bar */}
      <main className="w-full px-6 sm:px-12 lg:px-20 xl:px-28 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d4d0c7] mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-[#111111] text-white">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-display font-bold uppercase tracking-wider text-[#111111]">
                  Active Triage Queue
                </h2>
                {isLive ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono bg-emerald-600 text-white font-bold uppercase tracking-wider">
                    ● LIVE SUPABASE
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono bg-[#999990] text-white font-semibold uppercase tracking-wider">
                    DEMO MOCK
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-[#666660]">
                {filteredPRs.length} PRs prioritised by risk surface blast radius
              </p>
            </div>
          </div>

          {/* Search, Refresh & Severity Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadPRs}
              title="Refresh queue"
              className="p-1.5 bg-[#f7f5f0] border border-[#d4d0c7] hover:border-[#111111] text-[#111111] transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888880]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title, author, #..."
                className="pl-8 pr-3 py-1.5 bg-[#f7f5f0] border border-[#d4d0c7] text-xs font-mono text-[#111111] placeholder-[#888880] focus:outline-none focus:border-[#111111] w-48 sm:w-64 transition-colors"
              />
            </div>

            <div className="flex items-center border border-[#d4d0c7] bg-[#f7f5f0] text-xs font-mono">
              {["ALL", "CRITICAL", "HIGH", "LOW"].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterSeverity(level)}
                  className={`px-3 py-1.5 transition-colors ${
                    filterSeverity === level
                      ? "bg-[#111111] text-[#f7f5f0] font-bold"
                      : "text-[#666660] hover:text-[#111111] hover:bg-[#e8e5df]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PR Queue Cards */}
        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="border border-[#d4d0c7] bg-[#f7f5f0] p-6 animate-pulse">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pl-2">
                  <div className="flex-1 space-y-4 pt-2">
                    <div className="h-4 w-1/2 bg-[#d4d0c7]" />
                    <div className="h-6 w-3/4 bg-[#d4d0c7]" />
                    <div className="h-16 w-full bg-[#d4d0c7]" />
                    <div className="h-4 w-1/3 bg-[#d4d0c7]" />
                  </div>
                  <div className="h-20 w-32 bg-[#d4d0c7]" />
                </div>
              </div>
            ))
          ) : filteredPRs.length === 0 ? (
            <div className="p-8 text-center border border-[#d4d0c7] bg-[#f7f5f0] text-sm font-mono text-[#666660]">
              No PRs found matching your filters.
            </div>
          ) : (
            filteredPRs.map((pr) => {
              const isCritical = pr.risk_level === "CRITICAL";
            const isHigh = pr.risk_level === "HIGH";

            return (
              <div
                key={pr.id}
                className="group relative border border-[#d4d0c7] bg-[#f7f5f0] p-6 transition-all duration-200 hover:border-[#111111] hover:shadow-sm"
              >
                {/* Left accent indicator bar */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isCritical 
                      ? "bg-[#e63920]" 
                      : isHigh 
                      ? "bg-[#f97316]" 
                      : "bg-[#107040]"
                  }`}
                />

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pl-2">
                  {/* Left: PR Hierarchy & Signals */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                      <span className="font-bold text-[#e63920] bg-[#efece6] border border-[#d4d0c7] px-2 py-0.5">
                        PR #{pr.number}
                      </span>
                      <span className="text-[#b5b0a4]">·</span>
                      <span className="text-[#555550]">by @{pr.author_login}</span>
                      <span className="text-[#b5b0a4]">·</span>
                      <span className="flex items-center text-[#555550]">
                        <GitBranch className="h-3 w-3 mr-1 text-[#111111]" />
                        {pr.head_branch}
                      </span>
                      <span className="text-[#b5b0a4]">·</span>
                      <span className="text-[#777770]">{formatRelativeTime(pr.github_updated_at)}</span>
                    </div>

                    <Link
                      to={`/pr/${pr.number}`}
                      className="group/link inline-flex items-center space-x-2 text-lg font-display font-bold text-[#111111] hover:text-[#e63920] transition-colors"
                    >
                      <span className="tracking-tight">{pr.title}</span>
                      <ArrowUpRight className="h-4 w-4 text-[#888880] group-hover/link:text-[#e63920] transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </Link>

                    {/* AI Brief Insight Box - Architectural Panel */}
                    {pr.review_brief && (
                      <div className="border border-[#d4d0c7] bg-[#efece6] p-3.5 text-xs">
                        <div className="flex items-center space-x-2 text-[#111111] font-mono text-[11px] mb-1 font-bold uppercase tracking-wider">
                          <Sparkles className="h-3 w-3 text-[#e63920]" />
                          <span>SYNTHESIZED REVIEW BRIEF</span>
                        </div>
                        <p className="text-[#444440] leading-relaxed font-sans">
                          {pr.review_brief.summary}
                        </p>
                        {pr.review_brief.key_risks && (
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {pr.review_brief.key_risks.slice(0, 2).map((risk, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center text-[10px] font-mono text-[#e63920] bg-[#f7f5f0] border border-[#d4d0c7] px-2 py-0.5 font-medium"
                              >
                                ⚠ {risk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Code Change Metrics */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#666660] pt-1">
                      <span className="text-[#107040] font-semibold">+{pr.additions} lines</span>
                      <span className="text-[#e63920] font-semibold">-{pr.deletions} lines</span>
                      <span>{pr.changed_files_count} files changed</span>
                      <span className="text-[#111111] font-mono">HEAD: {pr.head_commit_sha}</span>
                    </div>
                  </div>

                  {/* Right: Risk Surface Score & Action Button */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 border-[#d4d0c7] pt-4 lg:pt-0 min-w-[170px]">
                    <div className="flex flex-col lg:items-end">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-[#666660] font-semibold">
                        RISK METRIC
                      </span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span
                          className={`text-4xl font-mono font-extrabold tracking-tight ${
                            isCritical
                              ? "text-[#e63920]"
                              : isHigh
                              ? "text-[#f97316]"
                              : "text-[#107040]"
                          }`}
                        >
                          {pr.risk_score}
                        </span>
                        <span className="text-xs font-mono text-[#888880]">/100</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase border ${
                          isCritical
                            ? "bg-[#e63920] text-white border-[#e63920]"
                            : isHigh
                            ? "bg-[#f97316] text-white border-[#f97316]"
                            : "bg-[#107040] text-white border-[#107040]"
                        }`}
                      >
                        {pr.risk_level}
                      </span>

                      <Link
                        to={`/pr/${pr.number}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#111111] hover:bg-[#e63920] text-xs font-mono text-[#f7f5f0] hover:text-white border border-[#111111] transition-all duration-150"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </main>
    </div>
  );
};
