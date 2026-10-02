import React from "react";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Code2, 
  Layers, 
  Terminal
} from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#efece6] text-[#111111] pb-24 selection:bg-[#e63920] selection:text-white">
      {/* 01 // HERO PITCH: The Premise */}
      <section className="relative border-b border-[#d4d0c7] bg-[#efece6] bg-grid-pattern px-6 sm:px-12 lg:px-20 xl:px-28 py-12 lg:py-16 min-h-[340px] flex items-center overflow-hidden">
        {/* Constructivist Geometric Accents */}
        <div className="absolute right-12 top-6 w-36 h-36 rounded-full bg-[#e63920] opacity-90 hidden lg:block pointer-events-none" />
        <div className="absolute right-36 top-16 w-24 h-24 bg-[#111111] opacity-90 hidden lg:block pointer-events-none" />

        <div className="w-full relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-[#111111] text-[11px] font-mono text-[#f7f5f0] uppercase tracking-wider mb-5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e63920] animate-pulse" />
                <span>THE THESIS // ARCHITECTURAL SAFETY MANIFESTO</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#111111] leading-[1.05] uppercase">
                <div>MODERN CODE REVIEW,</div>
                <div className="text-[#666660] font-normal">IS BROKEN BY DEFAULT.</div>
              </h1>

              <p className="mt-5 text-sm sm:text-base text-[#444440] max-w-2xl leading-relaxed font-sans">
                Software scales faster than human capacity to model cross-service dependency trees. PR Sentinel grounds AI in deterministic AST blast radii so senior engineers stop guessing and start preventing production incidents.
              </p>
            </div>

            {/* Asymmetrical Metric Surface - Architectural Drafting Grid */}
            <div className="flex flex-wrap sm:flex-nowrap gap-0 bg-[#d4d0c7] p-px border border-[#111111] shadow-sm">
              <div className="flex flex-col bg-[#f7f5f0] px-6 py-5 min-w-[130px] border-r border-[#d4d0c7]">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#666660]">
                  HUMAN ROLE
                </span>
                <span className="text-3xl font-mono font-extrabold text-[#111111] tracking-tight mt-1">
                  100<span className="text-xs font-normal text-[#666660]">%</span>
                </span>
                <span className="text-[10px] font-mono text-[#107040] mt-1 font-bold">
                  ✓ SOVEREIGN
                </span>
              </div>
              <div className="flex flex-col bg-[#f7f5f0] px-6 py-5 min-w-[130px] border-r border-[#d4d0c7]">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#666660]">
                  AUTO-MERGES
                </span>
                <span className="text-3xl font-mono font-extrabold text-[#e63920] tracking-tight mt-1">
                  0
                </span>
                <span className="text-[10px] font-mono text-[#e63920] mt-1 font-bold">
                  ● STRICT ZERO
                </span>
              </div>
              <div className="flex flex-col bg-[#f7f5f0] px-6 py-5 min-w-[130px]">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#666660]">
                  CLOUD COST
                </span>
                <span className="text-3xl font-mono font-extrabold text-[#111111] tracking-tight mt-1">
                  $0<span className="text-xs font-normal text-[#666660]">/MO</span>
                </span>
                <span className="text-[10px] font-mono text-[#107040] mt-1 uppercase font-semibold">
                  100% Free Tiers
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 // ACT I: THE ANATOMY OF THE PROBLEM */}
      <section className="border-b border-[#d4d0c7] bg-[#f7f5f0] px-6 sm:px-12 lg:px-20 xl:px-28 py-16">
        <div className="w-full space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4d0c7] pb-6">
            <div>
              <span className="text-xs font-mono text-[#e63920] font-bold tracking-widest uppercase block mb-1">
                ACT I // THE CRISIS
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#111111] uppercase tracking-tight">
                Three Compounding Failures of Traditional Reviews
              </h2>
            </div>
            <span className="text-xs font-mono text-[#666660]">
              $2.4M avg cost of single production incident
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-[#d4d0c7] p-px border border-[#111111]">
            {/* Problem Card 1 */}
            <div className="bg-[#f7f5f0] p-8 space-y-4 border-b md:border-b-0 md:border-r border-[#d4d0c7]">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-extrabold text-[#e63920]">01</span>
                <AlertTriangle className="h-5 w-5 text-[#e63920]" />
              </div>
              <h3 className="text-lg font-display font-bold text-[#111111] uppercase">
                Invisible Blast Radii
              </h3>
              <p className="text-xs sm:text-sm text-[#555550] leading-relaxed font-sans">
                A 2-line change to an auth token utility or database connection pool can silently crash 14 downstream microservices. Standard git diffs show line changes, never architectural impact topologies.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#888880] border-t border-[#d4d0c7]">
                SYMPTOM: "LGTM" followed by P0 incident
              </div>
            </div>

            {/* Problem Card 2 */}
            <div className="bg-[#f7f5f0] p-8 space-y-4 border-b md:border-b-0 md:border-r border-[#d4d0c7]">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-extrabold text-[#e63920]">02</span>
                <Layers className="h-5 w-5 text-[#f97316]" />
              </div>
              <h3 className="text-lg font-display font-bold text-[#111111] uppercase">
                Reviewer Fatigue & Bottlenecks
              </h3>
              <p className="text-xs sm:text-sm text-[#555550] leading-relaxed font-sans">
                PRs are randomly assigned or left in team Slack channels. The few engineers who understand the modified domain get overwhelmed, while low-risk mechanical refactors wait days in the triage queue.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#888880] border-t border-[#d4d0c7]">
                SYMPTOM: 48-hour median review latency
              </div>
            </div>

            {/* Problem Card 3 */}
            <div className="bg-[#f7f5f0] p-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-extrabold text-[#e63920]">03</span>
                <Code2 className="h-5 w-5 text-[#111111]" />
              </div>
              <h3 className="text-lg font-display font-bold text-[#111111] uppercase">
                Hallucinatory "AI Reviewers"
              </h3>
              <p className="text-xs sm:text-sm text-[#555550] leading-relaxed font-sans">
                First-generation AI tools spew paragraphs of nitpicky style advice, hallucinate syntax errors, and offer zero verifiable proof, creating review noise that developers instinctively ignore.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#888880] border-t border-[#d4d0c7]">
                SYMPTOM: Developers mute AI bot notifications
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 // ACT II: THE ARCHITECTURAL SOLUTION */}
      <section className="border-b border-[#d4d0c7] bg-[#efece6] px-6 sm:px-12 lg:px-20 xl:px-28 py-16">
        <div className="w-full space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4d0c7] pb-6">
            <div>
              <span className="text-xs font-mono text-[#107040] font-bold tracking-widest uppercase block mb-1">
                ACT II // THE SYSTEM
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#111111] uppercase tracking-tight">
                How PR Sentinel Solves the Pipeline
              </h2>
            </div>
            <span className="text-xs font-mono text-[#666660]">
              Deterministic AST Grounding + Gemini AI + Ephemeral Sandbox
            </span>
          </div>

          {/* 4-Step Solution Pipeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-[#d4d0c7] bg-[#f7f5f0] p-6 space-y-3 shadow-sm">
              <div className="w-8 h-8 flex items-center justify-center bg-[#111111] text-white text-xs font-mono font-bold">
                01
              </div>
              <h4 className="font-display font-bold text-sm text-[#111111] uppercase">
                AST Blast Radius Mapping
              </h4>
              <p className="text-xs text-[#555550] leading-relaxed font-sans">
                Tree-sitter parses the abstract syntax tree of changed files, tracing call hierarchies and downstream dependents to construct an interactive topological blast radius.
              </p>
            </div>

            <div className="border border-[#d4d0c7] bg-[#f7f5f0] p-6 space-y-3 shadow-sm">
              <div className="w-8 h-8 flex items-center justify-center bg-[#e63920] text-white text-xs font-mono font-bold">
                02
              </div>
              <h4 className="font-display font-bold text-sm text-[#111111] uppercase">
                Deterministic Risk Scoring
              </h4>
              <p className="text-xs text-[#555550] leading-relaxed font-sans">
                Mathematical risk model (0-100) combining structural complexity, sensitive directory boundaries, historical churn, and static Semgrep policy violations.
              </p>
            </div>

            <div className="border border-[#d4d0c7] bg-[#f7f5f0] p-6 space-y-3 shadow-sm">
              <div className="w-8 h-8 flex items-center justify-center bg-[#111111] text-white text-xs font-mono font-bold">
                03
              </div>
              <h4 className="font-display font-bold text-sm text-[#111111] uppercase">
                5-Part Explainable Findings
              </h4>
              <p className="text-xs text-[#555550] leading-relaxed font-sans">
                Every warning provides: Title, Hazard Explanation, Blast Impact, Static Evidence, and a pre-compiled patch code fix ready for developer review.
              </p>
            </div>

            <div className="border border-[#d4d0c7] bg-[#f7f5f0] p-6 space-y-3 shadow-sm">
              <div className="w-8 h-8 flex items-center justify-center bg-[#107040] text-white text-xs font-mono font-bold">
                04
              </div>
              <h4 className="font-display font-bold text-sm text-[#111111] uppercase">
                Isolated Sandbox Validation
              </h4>
              <p className="text-xs text-[#555550] leading-relaxed font-sans">
                Proposed patches are applied in ephemeral GitHub Actions test containers to prove tests compile and pass before suggesting them to human engineers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 04 // ACT III: ZERO-BUDGET ARCHITECTURE */}
      <section className="border-b border-[#d4d0c7] bg-[#f7f5f0] px-6 sm:px-12 lg:px-20 xl:px-28 py-16">
        <div className="w-full space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4d0c7] pb-6">
            <div>
              <span className="text-xs font-mono text-[#e63920] font-bold tracking-widest uppercase block mb-1">
                ACT III // SUSTAINABILITY
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#111111] uppercase tracking-tight">
                Enterprise Power, $0.00 / Month Infrastructure
              </h2>
            </div>
            <span className="text-xs font-mono text-[#107040] font-bold">
              100% Serverless & Ephemeral
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-[#d4d0c7] bg-[#efece6] p-8 space-y-6">
              <h3 className="font-display font-bold text-lg text-[#111111] uppercase">
                Why Zero-Budget Matters
              </h3>
              <p className="text-sm text-[#444440] leading-relaxed font-sans">
                Enterprise developer tools often charge $40-$100 per seat per month while running idle VMs that burn cloud budgets. PR Sentinel is architected from the ground up to utilize high-performance, generous free tiers:
              </p>
              <ul className="space-y-3 text-xs font-mono text-[#333330]">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-[#107040] shrink-0 mt-0.5" />
                  <span><strong>GitHub Actions:</strong> Ephemeral runners spin up on webhook, execute AST analysis in 18s, and shut down. Zero idle compute.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-[#107040] shrink-0 mt-0.5" />
                  <span><strong>Supabase PostgreSQL:</strong> Row-level security, realtime events, and migrations with zero maintenance overhead.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-[#107040] shrink-0 mt-0.5" />
                  <span><strong>Google Gemini 1.5 Flash:</strong> High-speed reasoning with large context windows for multi-file AST inspection.</span>
                </li>
              </ul>
            </div>

            {/* Architecture Flow Box */}
            <div className="border border-[#111111] bg-[#111111] p-8 text-[#f7f5f0] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#333330]">
                <span className="font-mono text-xs text-[#e63920] uppercase font-bold">
                  CANONICAL DISPATCH FLOW
                </span>
                <Terminal className="h-4 w-4 text-[#e63920]" />
              </div>
              <pre className="text-xs font-mono text-[#b5b0a4] leading-relaxed overflow-x-auto">
{`GitHub PR Event
  ↓
Deno Edge Webhook (HMAC verified)
  ↓
Job Enqueued in Supabase DB
  ↓
Ephemeral GitHub Action Runner
  ├─ AST Tree-sitter Extraction
  ├─ Semgrep Static Policy Rules
  ├─ Gemini 1.5 Flash Synthesis
  └─ Deterministic Risk Score
  ↓
Interactive Sentinel Dashboard
  ↓
Human Approval & Review Dispatch`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 05 // ACT IV: THE PHILOSOPHY (HUMAN IN THE LOOP) */}
      <section className="px-6 sm:px-12 lg:px-20 xl:px-28 py-16 bg-[#efece6]">
        <div className="w-full border border-[#111111] bg-[#f7f5f0] p-8 sm:p-12 space-y-6">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-[#107040] text-[10px] font-mono text-white uppercase font-bold tracking-wider">
            <Lock className="h-3 w-3" />
            <span>NON-NEGOTIABLE SAFETY GUARANTEE</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-display font-extrabold text-[#111111] uppercase tracking-tight">
            AI Informs. Humans Decide. No Auto-Merges.
          </h3>

          <p className="text-sm sm:text-base text-[#444440] max-w-3xl leading-relaxed font-sans">
            PR Sentinel is strictly designed as an intelligence and decision-support accelerator, never an autonomous committer. It never merges code automatically, never makes decisions in the dark, and always keeps the engineering team in sovereign control of their codebase.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#111111] hover:bg-[#e63920] text-xs font-mono font-bold text-white transition-all uppercase tracking-wider"
            >
              <span>Explore Triage Queue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/command-center"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#efece6] hover:bg-[#e2ded5] border border-[#d4d0c7] text-xs font-mono font-bold text-[#111111] transition-all uppercase tracking-wider"
            >
              <span>View Live Telemetry</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
