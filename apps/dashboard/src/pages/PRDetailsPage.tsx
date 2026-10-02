import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles,
  UserCheck,
  Check,
  Play,
  MessageSquareCode
} from "lucide-react";
import { RiskSurfaceGraph } from "../components/RiskSurfaceGraph";
import type { Finding, ReviewerRecommendation } from "../types";

const MOCK_FINDINGS: Finding[] = [
  {
    id: "f-1",
    analysis_run_id: "run-184",
    pull_request_id: "pr-184",
    severity: "CRITICAL",
    category: "BUG",
    title: "Unbounded reconnection retry loop triggers thread starvation",
    explanation: "When Redis session store fails to acknowledge ping within 500ms, the reconnect handler initiates exponential retries without max jitter or ceiling backoff.",
    file_path: "src/auth/session.ts",
    line_start: 88,
    line_end: 114,
    impact: "Can cause complete process lockup and HTTP gateway 504 timeouts under failover.",
    evidence: "AST pattern match: Async while(true) loop lacks break termination condition on Redis network timeout.",
    proposed_fix: `// Bounded exponential backoff with jitter
const delay = Math.min(1000 * Math.pow(2, attempts), 30000) + Math.random() * 500;
await sleep(delay);`,
    confidence: 0.96,
    source: "deterministic",
    validation_status: "VALIDATED",
    is_dismissed: false,
    created_at: new Date().toISOString()
  },
  {
    id: "f-2",
    analysis_run_id: "run-184",
    pull_request_id: "pr-184",
    severity: "HIGH",
    category: "SECURITY",
    title: "JWT secret token validation fallback uses weak mock key in non-production environments",
    explanation: "If process.env.JWT_SECRET is undefined, an unauthenticated developer key is accepted.",
    file_path: "src/auth/jwt.ts",
    line_start: 42,
    line_end: 56,
    impact: "High risk of security bypass if staging container configuration fails to mount environment secret.",
    evidence: "Static match: Hardcoded secret fallback pattern verified via Semgrep rule.",
    proposed_fix: `if (!process.env.JWT_SECRET) {
  throw new Error("Fatal: JWT_SECRET environment variable must be specified.");
}`,
    confidence: 0.99,
    source: "deterministic",
    validation_status: "PENDING",
    is_dismissed: false,
    created_at: new Date().toISOString()
  }
];

const MOCK_REVIEWERS: ReviewerRecommendation[] = [
  {
    id: "rev-1",
    pull_request_id: "pr-184",
    recommended_login: "marcus-dev",
    score: 94.2,
    match_reasons: [
      "Authored 68% of commits to src/auth/session.ts in past 90 days",
      "Resolved 4 high-severity PRs touching Redis connection pool",
      "Currently within healthy review workload quota (1 active PR)"
    ],
    is_assigned: true
  },
  {
    id: "rev-2",
    pull_request_id: "pr-184",
    recommended_login: "priya-sec",
    score: 87.5,
    match_reasons: [
      "Code owner for src/auth/ security boundary",
      "Historical review approval rate: 96%"
    ],
    is_assigned: false
  }
];

export const PRDetailsPage: React.FC = () => {
  const { prNumber } = useParams<{ prNumber: string }>();
  const [activeTab, setActiveTab] = useState<"findings" | "graph">("findings");
  const [approvedFixes, setApprovedFixes] = useState<Record<string, boolean>>({});

  const toggleApprove = (findingId: string) => {
    setApprovedFixes(prev => ({
      ...prev,
      [findingId]: !prev[findingId]
    }));
  };

  return (
    <div className="min-h-screen bg-[#efece6] text-[#111111] pb-24 selection:bg-[#e63920] selection:text-white">
      {/* Top Editorial Breadcrumb & Architectural PR Surface Header */}
      <section className="relative border-b border-[#d4d0c7] bg-[#efece6] bg-grid-pattern px-6 sm:px-12 lg:px-20 xl:px-28 py-8">
        <div className="w-full">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#555550] hover:text-[#e63920] mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>01 // RETURN TO TRIAGE QUEUE</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-[#666660] mb-2">
                <span className="font-bold text-white bg-[#e63920] px-2 py-0.5">
                  SURFACE #{prNumber || "184"}
                </span>
                <span>·</span>
                <span className="text-[#111111] font-semibold">alexchen / feat/auth-session-cache</span>
                <span>·</span>
                <span className="text-[#666660]">TARGET: main</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-[#111111] leading-tight">
                refactor(auth): migrate token rotation and session caching to async store
              </h1>
            </div>

            {/* Asymmetric Header Action & Risk Badge */}
            <div className="flex items-center space-x-4 bg-[#f7f5f0] border border-[#d4d0c7] p-4 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#666660] font-bold">
                  RISK ASSESSMENT
                </span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-3xl font-mono font-extrabold text-[#e63920]">84</span>
                  <span className="text-xs font-mono text-[#888880]">/100</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#e63920] text-white">
                    CRITICAL
                  </span>
                </div>
              </div>

              <div className="h-10 w-px bg-[#d4d0c7]" />

              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => alert("Simulated: Re-running GitHub Ephemeral Analysis Job...")}
                  className="px-3 py-1.5 bg-[#efece6] hover:bg-[#e2ded5] border border-[#d4d0c7] text-xs font-mono text-[#111111] font-medium transition-colors flex items-center space-x-1.5"
                >
                  <Play className="h-3 w-3 text-[#e63920]" />
                  <span>Re-run Analysis</span>
                </button>
                <button 
                  onClick={() => alert("Simulated: Synthesized review findings formatted into GitHub PR review comments.")}
                  className="px-3 py-1.5 bg-[#111111] hover:bg-[#e63920] text-xs font-mono font-bold text-white transition-colors flex items-center space-x-1.5"
                >
                  <MessageSquareCode className="h-3 w-3" />
                  <span>Post to GitHub</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center space-x-1 mt-8 border-b border-[#d4d0c7] -mb-8">
            <button
              onClick={() => setActiveTab("findings")}
              className={`px-4 py-2 text-xs font-mono tracking-wider border-b-2 transition-all ${
                activeTab === "findings"
                  ? "border-[#111111] text-[#111111] font-bold bg-[#f7f5f0]"
                  : "border-transparent text-[#666660] hover:text-[#111111]"
              }`}
            >
              01 // FINDINGS & EXPLAINABILITY ({MOCK_FINDINGS.length})
            </button>
            <button
              onClick={() => setActiveTab("graph")}
              className={`px-4 py-2 text-xs font-mono tracking-wider border-b-2 transition-all ${
                activeTab === "graph"
                  ? "border-[#111111] text-[#111111] font-bold bg-[#f7f5f0]"
                  : "border-transparent text-[#666660] hover:text-[#111111]"
              }`}
            >
              02 // AST BLAST RADIUS GRAPH
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Interactive Risk Surface */}
      <main className="w-full px-6 sm:px-12 lg:px-20 xl:px-28 py-12">
        {/* TAB 1: Findings, Explainability, Sandboxed Patches */}
        {activeTab === "findings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: 5-Part Findings */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-[#d4d0c7]">
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="h-4 w-4 text-[#e63920]" />
                  <h2 className="text-sm font-mono uppercase tracking-wider text-[#111111] font-bold">
                    Detected Engineering Findings
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#666660]">
                  Standard: What / Why / Where / Impact / Fix
                </span>
              </div>

              <div className="space-y-4">
                {MOCK_FINDINGS.map((finding) => (
                  <div
                    key={finding.id}
                    className="border border-[#d4d0c7] bg-[#f7f5f0] p-6 space-y-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-[#e63920] text-white">
                            {finding.severity}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#efece6] text-[#111111] border border-[#d4d0c7] font-semibold">
                            {finding.category}
                          </span>
                          <span className="text-xs font-mono text-[#666660]">
                            {finding.file_path}:{finding.line_start}-{finding.line_end}
                          </span>
                        </div>
                        <h3 className="text-base font-display font-bold text-[#111111]">
                          {finding.title}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono tracking-widest text-[#666660] block font-semibold">CONFIDENCE</span>
                        <div className="text-sm font-mono font-extrabold text-[#e63920]">
                          {Math.round(finding.confidence * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* 5-Part Explainability Sections - Architectural Drafting Surface */}
                    <div className="space-y-3 text-xs bg-[#efece6] p-4 border border-[#d4d0c7]">
                      <div>
                        <span className="font-mono text-[#111111] uppercase font-bold text-[10px] tracking-wider block mb-0.5">
                          [01] WHY THIS IS HAZARDOUS
                        </span>
                        <p className="text-[#333330] leading-relaxed font-sans">{finding.explanation}</p>
                      </div>

                      <div>
                        <span className="font-mono text-[#e63920] uppercase font-bold text-[10px] tracking-wider block mb-0.5">
                          [02] BLAST RADIUS & IMPACT
                        </span>
                        <p className="text-[#c02810] font-semibold leading-relaxed font-sans">{finding.impact}</p>
                      </div>

                      <div>
                        <span className="font-mono text-[#666660] uppercase font-bold text-[10px] tracking-wider block mb-0.5">
                          [03] DETERMINISTIC EVIDENCE
                        </span>
                        <p className="font-mono text-[#111111] bg-[#f7f5f0] p-2.5 border border-[#d4d0c7] text-[11px]">
                          {finding.evidence}
                        </p>
                      </div>
                    </div>

                    {/* Proposed Fix & Validation */}
                    {finding.proposed_fix && (
                      <div className="border-t border-[#d4d0c7] pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5 text-xs font-mono text-[#111111]">
                            <Sparkles className="h-3.5 w-3.5 text-[#e63920]" />
                            <span className="font-bold uppercase tracking-wider">
                              PROPOSED FIX (SANDBOX VALIDATED)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7] font-bold">
                            {finding.validation_status}
                          </span>
                        </div>

                        <pre className="p-3.5 bg-[#111111] border border-[#111111] text-xs font-mono text-[#10b981] overflow-x-auto leading-relaxed">
                          <code>{finding.proposed_fix}</code>
                        </pre>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] font-mono text-[#666660]">
                            Validation: ephemeral test suite passed cleanly.
                          </span>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleApprove(finding.id)}
                              className={`px-3 py-1.5 text-xs font-mono font-bold transition-all flex items-center space-x-1.5 ${
                                approvedFixes[finding.id]
                                  ? "bg-[#1b5e20] text-white"
                                  : "bg-[#111111] hover:bg-[#e63920] text-white"
                              }`}
                            >
                              {approvedFixes[finding.id] ? (
                                <>
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                  <span>Patch Approved</span>
                                </>
                              ) : (
                                <>
                                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                  <span>Approve Patch</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: AI Review Brief & Recommended Reviewers */}
            <div className="space-y-6">
              {/* AI Review Brief */}
              <div className="border border-[#d4d0c7] bg-[#f7f5f0] p-5 space-y-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-[#e63920]" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#111111] font-bold">
                    AI Review Brief
                  </h3>
                </div>
                <p className="text-xs text-[#444440] leading-relaxed font-sans">
                  This PR alters critical session caching boundaries. The primary danger surface is fallback reconnection loops when the Redis cluster is unreachable under high concurrency.
                </p>

                <div className="border-t border-[#d4d0c7] pt-3">
                  <span className="text-[11px] font-mono uppercase text-[#666660] block mb-2 font-bold tracking-wider">
                    Recommended Test Strategy:
                  </span>
                  <ul className="text-xs text-[#333330] space-y-1.5 list-disc list-inside font-sans">
                    <li>Simulate 2s network partition under load</li>
                    <li>Verify token revocation idempotency</li>
                  </ul>
                </div>
              </div>

              {/* Reviewer Recommendation Engine */}
              <div className="border border-[#d4d0c7] bg-[#f7f5f0] p-5 space-y-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-[#e63920]" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#111111] font-bold">
                    Recommended Reviewers
                  </h3>
                </div>
                <p className="text-xs text-[#666660]">
                  Calculated from git commit frequency and security boundary code-ownership.
                </p>

                <div className="space-y-3">
                  {MOCK_REVIEWERS.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 bg-[#efece6] border border-[#d4d0c7] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#111111]">
                          @{rev.recommended_login}
                        </span>
                        <span className="text-[11px] font-mono text-[#e63920] font-bold">
                          {rev.score}% MATCH
                        </span>
                      </div>

                      <ul className="text-[11px] text-[#444440] space-y-1">
                        {rev.match_reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-[#e63920] font-bold">›</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Reassurance */}
              <div className="p-3.5 bg-[#efece6] border border-[#d4d0c7] text-center">
                <span className="text-[11px] font-mono text-[#666660] uppercase tracking-wider font-semibold">
                  Human-in-the-Loop Enforced · No Auto-Merge
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Interactive Blast Radius Graph */}
        {activeTab === "graph" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#d4d0c7]">
              <div>
                <h2 className="text-base font-display font-bold uppercase tracking-wider text-[#111111]">
                  AST Blast Radius & Dependency Topology
                </h2>
                <p className="text-xs font-mono text-[#666660]">
                  Interactive architectural blueprint of touched functions, blast impact, and call chains
                </p>
              </div>
              <span className="text-xs font-mono text-[#e63920] bg-[#efece6] border border-[#d4d0c7] px-2 py-1 font-bold">
                React Flow Engine Active
              </span>
            </div>

            <RiskSurfaceGraph prNumber={Number(prNumber) || 184} />
          </div>
        )}
      </main>
    </div>
  );
};
