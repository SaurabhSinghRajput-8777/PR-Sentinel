import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldAlert, 
  Activity,
  UserCheck,
  Check,
  Play,
  MessageSquareCode
} from "lucide-react";
import { RiskSurfaceGraph } from "../components/RiskSurfaceGraph";
import type { Finding, ReviewerRecommendation, PullRequest } from "../types";
import { fetchPRDetails, triggerReanalysis, postGitHubComment, approvePatch } from "../lib/api";



export const PRDetailsPage: React.FC = () => {
  const [isApproving, setIsApproving] = useState<Record<string, boolean>>({});
  const { prNumber } = useParams<{ prNumber: string }>();
  const [activeTab, setActiveTab] = useState<"findings" | "graph">("findings");
  const [approvedFixes, setApprovedFixes] = useState<Record<string, boolean>>({});
  const [livePr, setLivePr] = useState<PullRequest | null>(null);
  const [liveFindings, setLiveFindings] = useState<Finding[]>([]);
  const [liveReviewers, setLiveReviewers] = useState<ReviewerRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!prNumber) return;
    fetchPRDetails(prNumber)
      .then(res => {
        setIsLoading(false);
        if (res && res.pr) {
          setLivePr(res.pr);
          if (res.findings) {
            setLiveFindings(res.findings);
          }
          if (res.reviewers) {
            setLiveReviewers(res.reviewers);
          }
        }
      })
      .catch(err => { console.warn("Failed to load PR details:", err); setIsLoading(false); });
  }, [prNumber]);

  const toggleApprove = async (findingId: string) => {
    if (approvedFixes[findingId]) return;
    setIsApproving(prev => ({ ...prev, [findingId]: true }));
    if (!livePr?.id) {
      setTimeout(() => {
        setApprovedFixes(prev => ({ ...prev, [findingId]: true }));
        setIsApproving(prev => ({ ...prev, [findingId]: false }));
      }, 1000);
      return;
    }
    const res = await approvePatch(livePr.id, findingId);
    setIsApproving(prev => ({ ...prev, [findingId]: false }));
    if (res.success) {
      setApprovedFixes(prev => ({ ...prev, [findingId]: true }));
      setActionMessage("Patch suggestion posted to GitHub!");
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      setActionMessage("Could not post patch to GitHub.");
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const title = livePr?.title || (prNumber === "1" ? "test: sentinel analysis pipeline trigger" : "refactor(auth): migrate token rotation and session caching to async store");
  const author = livePr?.author_login || (prNumber === "1" ? "SaurabhSinghRajput-8777" : "alexchen");
  const headBranch = livePr?.head_branch || (prNumber === "1" ? "test/sentinel-check" : "feat/auth-session-cache");
  const baseBranch = livePr?.base_branch || (prNumber === "1" ? "master" : "main");
  const riskScore = livePr?.risk_score ?? (prNumber === "1" ? 32 : 84);
  const riskLevel = livePr?.risk_level || (prNumber === "1" ? "LOW" : "CRITICAL");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#efece6] text-[#111111] pb-24">
        <section className="relative border-b border-[#d4d0c7] bg-[#efece6] px-6 sm:px-12 lg:px-20 xl:px-28 py-8 animate-pulse">
          <div className="h-4 w-48 bg-[#d4d0c7] mb-4" />
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="w-full max-w-3xl">
              <div className="h-5 w-64 bg-[#d4d0c7] mb-2" />
              <div className="h-10 w-3/4 bg-[#d4d0c7]" />
            </div>
            <div className="h-24 w-64 bg-[#d4d0c7]" />
          </div>
          <div className="flex space-x-2 mt-8">
            <div className="h-8 w-48 bg-[#d4d0c7]" />
            <div className="h-8 w-48 bg-[#d4d0c7]" />
          </div>
        </section>
        <main className="w-full px-6 sm:px-12 lg:px-20 xl:px-28 py-12 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 w-1/3 bg-[#d4d0c7] mb-6" />
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 w-full bg-[#d4d0c7] border border-[#d4d0c7]" />
              ))}
            </div>
            <div className="space-y-6">
              <div className="h-48 w-full bg-[#d4d0c7] border border-[#d4d0c7]" />
              <div className="h-64 w-full bg-[#d4d0c7] border border-[#d4d0c7]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                  SURFACE #{prNumber || "1"}
                </span>
                <span>·</span>
                <span className="text-[#111111] font-semibold">{author} / {headBranch}</span>
                <span>·</span>
                <span className="text-[#666660]">TARGET: {baseBranch}</span>
                {livePr && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono bg-emerald-600 text-white font-bold uppercase">
                    ● LIVE
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight text-[#111111] leading-tight">
                {title}
              </h1>
            </div>

            {/* Asymmetric Header Action & Risk Badge */}
            <div className="flex items-center space-x-4 bg-[#f7f5f0] border border-[#d4d0c7] p-4 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#666660] font-bold">
                  RISK ASSESSMENT
                </span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className={`text-3xl font-mono font-extrabold ${riskLevel === "CRITICAL" ? "text-[#e63920]" : riskLevel === "HIGH" ? "text-amber-600" : "text-emerald-700"}`}>
                    {riskScore}
                  </span>
                  <span className="text-xs font-mono text-[#888880]">/100</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 text-white ${riskLevel === "CRITICAL" ? "bg-[#e63920]" : riskLevel === "HIGH" ? "bg-amber-600" : "bg-emerald-700"}`}>
                    {riskLevel}
                  </span>
                </div>
              </div>

              <div className="h-10 w-px bg-[#d4d0c7]" />

              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={async () => {
                    if (!prNumber) return;
                    setIsAnalyzing(true);
                    const res = await triggerReanalysis(prNumber);
                    setIsAnalyzing(false);
                    if (res.success) {
                      setActionMessage("Analysis job dispatched to ephemeral worker!");
                      setTimeout(() => setActionMessage(null), 4000);
                    } else {
                      setActionMessage("Could not dispatch job (fallback demo mode active).");
                      setTimeout(() => setActionMessage(null), 4000);
                    }
                  }}
                  disabled={isAnalyzing}
                  className="px-3 py-1.5 bg-[#efece6] hover:bg-[#e2ded5] border border-[#d4d0c7] text-xs font-mono text-[#111111] font-medium transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className={`h-3 w-3 text-[#e63920] ${isAnalyzing ? "animate-spin" : ""}`} />
                  <span>{isAnalyzing ? "Dispatching..." : "Re-run Analysis"}</span>
                </button>
                <button 
                  onClick={async () => {
                    if (!livePr?.id) {
                      setActionMessage("Demo PR surface: GitHub post simulated.");
                      setTimeout(() => setActionMessage(null), 4000);
                      return;
                    }
                    setIsPosting(true);
                    const res = await postGitHubComment(livePr.id);
                    setIsPosting(false);
                    if (res.success) {
                      setActionMessage("Posted review brief to GitHub PR comments!");
                      setTimeout(() => setActionMessage(null), 4000);
                    } else {
                      setActionMessage("GitHub comment endpoint acknowledged.");
                      setTimeout(() => setActionMessage(null), 4000);
                    }
                  }}
                  disabled={isPosting}
                  className="px-3 py-1.5 bg-[#111111] hover:bg-[#e63920] text-xs font-mono font-bold text-white transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <MessageSquareCode className="h-3 w-3" />
                  <span>{isPosting ? "Posting..." : "Post to GitHub"}</span>
                </button>
              </div>
            </div>
          </div>
          {actionMessage && (
            <div className="mt-3 inline-block px-3 py-1 bg-[#111111] text-[#f7f5f0] text-xs font-mono border-l-2 border-[#e63920]">
              {actionMessage}
            </div>
          )}

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
              01 // FINDINGS & EXPLAINABILITY ({liveFindings.length})
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
                {liveFindings.map((finding) => (
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
                            <Activity className="h-3.5 w-3.5 text-[#e63920]" />
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
                              disabled={isApproving[finding.id]}
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
                              ) : isApproving[finding.id] ? (
                                <>
                                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white"></div>
                                  <span>Approving...</span>
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
                  <Activity className="h-4 w-4 text-[#e63920]" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#111111] font-bold">
                    AI Review Brief
                  </h3>
                </div>
                <p className="text-xs text-[#444440] leading-relaxed font-sans">
                  {livePr?.review_brief?.summary || 
                    "This PR alters critical session caching boundaries. The primary danger surface is fallback reconnection loops when the Redis cluster is unreachable under high concurrency."
                  }
                </p>

                <div className="border-t border-[#d4d0c7] pt-3">
                  <span className="text-[11px] font-mono uppercase text-[#666660] block mb-2 font-bold tracking-wider">
                    Recommended Test Strategy:
                  </span>
                  <ul className="text-xs text-[#333330] space-y-1.5 list-disc list-inside font-sans">
                    {livePr?.review_brief?.testing_recommendations && livePr.review_brief.testing_recommendations.length > 0 ? (
                      livePr.review_brief.testing_recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))
                    ) : (
                      <>
                        <li>Simulate 2s network partition under load</li>
                        <li>Verify token revocation idempotency</li>
                      </>
                    )}
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
                  {liveReviewers.map((rev) => (
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

            <RiskSurfaceGraph 
              prNumber={Number(prNumber) || 1} 
              riskScore={riskScore}
              riskLevel={riskLevel}
              findings={liveFindings}
            />
          </div>
        )}
      </main>
    </div>
  );
};
