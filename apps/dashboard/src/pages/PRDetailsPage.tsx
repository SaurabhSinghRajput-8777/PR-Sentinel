import React from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles,
  UserCheck
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
    evidence: "Detected by Semgrep AST rule: semgrep.rules.unbounded_reconnect + Tree-sitter async loop inspection.",
    proposed_fix: `// Apply bounded jitter backoff
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

  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f5f0] pb-24">
      {/* Top Breadcrumb & Metadata */}
      <div className="border-b border-[#262626] bg-[#0d0d0d] px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#a5a5a0] hover:text-[#d8ff3e] mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Queue</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-[#686863]">
                <span className="font-bold text-[#d8ff3e]">PR #{prNumber || "184"}</span>
                <span>·</span>
                <span className="text-[#a5a5a0]">alexchen / feat/auth-session-cache</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f5f5f0] mt-1">
                refactor(auth): migrate token rotation and session caching to async store
              </h1>
            </div>

            {/* Risk Indicator Card */}
            <div className="flex items-center space-x-4 bg-[#121212] border border-[#262626] rounded px-4 py-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase text-[#686863]">
                  RISK ASSESSMENT
                </span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-mono font-bold text-[#ff4d4d]">84</span>
                  <span className="text-xs font-mono text-[#686863]">/ 100</span>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 uppercase font-semibold">
                    CRITICAL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Evidence & Findings */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Risk Surface Dependency & Blast Radius Graph (Phase 14 & 15) */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-wider text-[#a5a5a0] flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-[#d8ff3e] inline-block" />
              <span>Interactive Risk Surface & Blast Radius Graph</span>
            </h2>
            <span className="text-xs font-mono text-[#686863]">
              React Flow Engine · AST Node Mapping
            </span>
          </div>
          <RiskSurfaceGraph prNumber={Number(prNumber) || 184} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Findings & Validation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-wider text-[#a5a5a0] flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-[#ff4d4d]" />
                <span>Detected Engineering Findings ({MOCK_FINDINGS.length})</span>
              </h2>
              <span className="text-xs font-mono text-[#686863]">
                5-Part Explainability Standard
              </span>
            </div>

            <div className="space-y-4">
              {MOCK_FINDINGS.map((finding) => (
                <div
                  key={finding.id}
                  className="rounded border border-[#262626] bg-[#121212] p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                          {finding.severity}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#181818] text-[#a5a5a0] border border-[#262626]">
                          {finding.category}
                        </span>
                        <span className="text-xs font-mono text-[#686863]">
                          {finding.file_path}:{finding.line_start}-{finding.line_end}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[#f5f5f0]">
                        {finding.title}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-[#686863]">CONFIDENCE</span>
                      <div className="text-xs font-mono font-bold text-[#d8ff3e]">
                        {Math.round(finding.confidence * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* 5-Part Explainability Sections */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-mono text-[#686863] uppercase font-bold text-[11px]">
                        WHY:{" "}
                      </span>
                      <span className="text-[#a5a5a0]">{finding.explanation}</span>
                    </div>

                    <div>
                      <span className="font-mono text-[#686863] uppercase font-bold text-[11px]">
                        IMPACT:{" "}
                      </span>
                      <span className="text-red-300/80">{finding.impact}</span>
                    </div>

                    <div className="rounded bg-[#080808] p-2.5 border border-[#202020]">
                      <span className="font-mono text-[#686863] uppercase font-bold text-[10px] block mb-1">
                        EVIDENCE:
                      </span>
                      <span className="font-mono text-[#a5a5a0]">{finding.evidence}</span>
                    </div>
                  </div>

                  {/* Proposed Fix & Validation */}
                  {finding.proposed_fix && (
                    <div className="border-t border-[#262626] pt-3 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5 text-xs font-mono text-[#38bdf8]">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>PROPOSED FIX (SANDBOX VALIDATED)</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {finding.validation_status}
                        </span>
                      </div>

                      <pre className="p-3 rounded bg-[#080808] border border-[#202020] text-xs font-mono text-[#10b981] overflow-x-auto">
                        <code>{finding.proposed_fix}</code>
                      </pre>

                      <div className="mt-3 flex items-center justify-end space-x-2">
                        <button className="px-3 py-1.5 rounded bg-[#181818] hover:bg-[#222222] border border-[#262626] text-xs font-mono text-[#a5a5a0] transition-colors">
                          Reject Fix
                        </button>
                        <button className="px-3 py-1.5 rounded bg-[#d8ff3e] hover:bg-[#c6f028] text-xs font-mono font-bold text-black transition-colors">
                          Approve & Commit Patch
                        </button>
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
            <div className="rounded border border-[#262626] bg-[#121212] p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-[#38bdf8]" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-[#f5f5f0]">
                  AI Review Brief
                </h3>
              </div>
              <p className="text-xs text-[#a5a5a0] leading-relaxed">
                This PR refactors session caching. Key danger surface focuses on fallback reconnection handling when Redis is unreachable.
              </p>

              <div className="border-t border-[#262626] pt-3">
                <span className="text-[11px] font-mono uppercase text-[#686863] block mb-2 font-bold">
                  Recommended Test Focus:
                </span>
                <ul className="text-xs text-[#a5a5a0] space-y-1.5 list-disc list-inside">
                  <li>Simulate 2s network partition under load</li>
                  <li>Verify token revocation idempotency</li>
                </ul>
              </div>
            </div>

            {/* Reviewer Recommendation */}
            <div className="rounded border border-[#262626] bg-[#121212] p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-[#d8ff3e]" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-[#f5f5f0]">
                  Recommended Reviewers
                </h3>
              </div>
              <p className="text-xs text-[#686863]">
                Matched against observable repository commit activity and review capacity.
              </p>

              <div className="space-y-3">
                {MOCK_REVIEWERS.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded bg-[#0d0d0d] border border-[#262626] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#f5f5f0]">
                        @{rev.recommended_login}
                      </span>
                      <span className="text-[11px] font-mono text-[#d8ff3e] font-bold">
                        {rev.score}% MATCH
                      </span>
                    </div>

                    <ul className="text-[11px] text-[#a5a5a0] space-y-1">
                      {rev.match_reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-[#686863]">›</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Human in the loop reassurance badge */}
            <div className="p-3 rounded bg-[#0d0d0d] border border-[#262626] text-center">
              <span className="text-[11px] font-mono text-[#686863] uppercase">
                Human-in-the-Loop Enforced · No Auto-Merge
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
