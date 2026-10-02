import React from "react";
import { Link } from "react-router-dom";
import { 
  Activity, 
  TrendingUp, 
  ArrowRight,
  Cpu
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";

const RISK_TREND_DATA = [
  { day: "Mon", avgRisk: 42, criticalCount: 0 },
  { day: "Tue", avgRisk: 58, criticalCount: 1 },
  { day: "Wed", avgRisk: 51, criticalCount: 1 },
  { day: "Thu", avgRisk: 74, criticalCount: 2 },
  { day: "Fri", avgRisk: 68, criticalCount: 1 },
  { day: "Sat", avgRisk: 45, criticalCount: 0 },
  { day: "Sun", avgRisk: 84, criticalCount: 1 },
];

const RECENT_RUNS = [
  {
    id: "run-984",
    prNumber: 184,
    title: "refactor(auth): migrate token rotation and session caching",
    status: "CRITICAL",
    riskScore: 84,
    duration: "24s",
    completedAt: "2 mins ago",
    ruleHits: ["unbounded_reconnect", "weak_jwt_secret"]
  },
  {
    id: "run-983",
    prNumber: 183,
    title: "feat(billing): implement webhook idempotency key validation",
    status: "HIGH",
    riskScore: 62,
    duration: "18s",
    completedAt: "48 mins ago",
    ruleHits: ["postgres_deadlock_risk"]
  },
  {
    id: "run-982",
    prNumber: 182,
    title: "chore(deps): update tree-sitter bindings and semgrep rules",
    status: "LOW",
    riskScore: 18,
    duration: "12s",
    completedAt: "2 hours ago",
    ruleHits: []
  },
  {
    id: "run-981",
    prNumber: 181,
    title: "fix(api): escape unvalidated user input in search query",
    status: "VALIDATED",
    riskScore: 35,
    duration: "15s",
    completedAt: "5 hours ago",
    ruleHits: ["patch_applied_sandbox_ok"]
  }
];

export const OpsOverviewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#efece6] text-[#111111] pb-24 selection:bg-[#e63920] selection:text-white">
      {/* Editorial Architectural Command Center Hero */}
      <section className="relative border-b border-[#d4d0c7] bg-[#efece6] bg-grid-pattern px-6 sm:px-12 lg:px-20 xl:px-28 py-12 lg:py-16 min-h-[340px] flex items-center overflow-hidden">
        {/* Constructivist Accent Geometry */}
        <div className="absolute right-12 top-6 w-36 h-36 rounded-full bg-[#e63920] opacity-90 hidden lg:block pointer-events-none" />
        <div className="absolute right-36 top-16 w-24 h-24 bg-[#111111] opacity-90 hidden lg:block pointer-events-none" />

        <div className="w-full relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-[#111111] text-[11px] font-mono text-[#f7f5f0] uppercase tracking-wider mb-5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e63920] animate-pulse" />
                <span>COMMAND CENTER // TELEMETRY & RUNNER OBSERVABILITY</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[#111111] leading-[1.05] uppercase">
                <div>ENGINEERING RISK,</div>
                <div className="text-[#666660] font-normal">OPERATIONAL INTELLIGENCE.</div>
              </h1>
              
              <p className="mt-5 text-sm sm:text-base text-[#444440] max-w-2xl leading-relaxed font-sans">
                Aggregated repository health, AST anomaly distribution, validation sandbox throughput, and real-time review dispatch metrics across all connected repositories.
              </p>
            </div>

            {/* Asymmetrical Metric Surface - Architectural Drafting Grid */}
            <div className="flex flex-wrap sm:flex-nowrap gap-0 bg-[#d4d0c7] p-px border border-[#111111] shadow-sm">
              <div className="flex flex-col bg-[#f7f5f0] px-6 py-5 min-w-[130px] border-r border-[#d4d0c7]">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#666660]">
                  ANALYSIS JOBS
                </span>
                <span className="text-3xl font-mono font-extrabold text-[#111111] tracking-tight mt-1">
                  148
                </span>
                <span className="text-[10px] font-mono text-[#107040] mt-1 font-bold">
                  ↑ 100% HEALTH
                </span>
              </div>
              <div className="flex flex-col bg-[#f7f5f0] px-6 py-5 min-w-[130px] border-r border-[#d4d0c7]">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#666660]">
                  BLOCKED OUTAGES
                </span>
                <span className="text-3xl font-mono font-extrabold text-[#e63920] tracking-tight mt-1">
                  12
                </span>
                <span className="text-[10px] font-mono text-[#e63920] mt-1 font-bold">
                  ● PRE-MERGE SAVES
                </span>
              </div>
              <div className="flex flex-col bg-[#f7f5f0] px-6 py-5 min-w-[130px]">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#666660]">
                  MEDIAN SPEED
                </span>
                <span className="text-3xl font-mono font-extrabold text-[#111111] tracking-tight mt-1">
                  18.4<span className="text-xs font-normal text-[#666660]">s</span>
                </span>
                <span className="text-[10px] font-mono text-[#666660] mt-1 uppercase">
                  Ephemeral Runner
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Command Dashboard Layout */}
      <main className="w-full px-6 sm:px-12 lg:px-20 xl:px-28 py-10 space-y-10">
        {/* Top Split: Risk Trend Chart vs Active Blast Radii */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Trend Chart (2 Cols) */}
          <div className="lg:col-span-2 border border-[#d4d0c7] bg-[#f7f5f0] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#d4d0c7]">
              <div className="flex items-center space-x-2.5">
                <TrendingUp className="h-4 w-4 text-[#e63920]" />
                <h2 className="text-sm font-display font-bold uppercase tracking-wider text-[#111111]">
                  7-Day Repository Risk Anomaly Trend
                </h2>
              </div>
              <span className="text-xs font-mono text-[#666660]">
                METRIC: AST RISK SCORE (0-100)
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={RISK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e63920" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#e63920" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e0ded7" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#666660" 
                    fontSize={11} 
                    tickLine={false} 
                    fontFamily="JetBrains Mono" 
                  />
                  <YAxis 
                    stroke="#666660" 
                    fontSize={11} 
                    tickLine={false} 
                    fontFamily="JetBrains Mono" 
                    domain={[0, 100]} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#f7f5f0", 
                      borderColor: "#d4d0c7", 
                      borderRadius: "0px", 
                      fontSize: "12px", 
                      fontFamily: "JetBrains Mono",
                      color: "#111111" 
                    }} 
                    itemStyle={{ color: "#e63920" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgRisk" 
                    stroke="#e63920" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#riskGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#666660] pt-2 border-t border-[#d4d0c7]">
              <span>Lowest Risk: Mon (42/100)</span>
              <span className="text-[#e63920] font-bold">Peak Anomaly: Sun PR #184 (84/100)</span>
            </div>
          </div>

          {/* Infrastructure & Engine Status (1 Col) */}
          <div className="border border-[#d4d0c7] bg-[#f7f5f0] p-6 space-y-5 shadow-sm">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#d4d0c7]">
              <Cpu className="h-4 w-4 text-[#e63920]" />
              <h2 className="text-sm font-display font-bold uppercase tracking-wider text-[#111111]">
                Zero-Budget Architecture
              </h2>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between p-3 bg-[#efece6] border border-[#d4d0c7]">
                <span className="text-[#555550]">Compute Runtime</span>
                <span className="text-[#111111] font-bold">GitHub Actions</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#efece6] border border-[#d4d0c7]">
                <span className="text-[#555550]">Database & Auth</span>
                <span className="text-[#111111] font-bold">Supabase PostgreSQL</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#efece6] border border-[#d4d0c7]">
                <span className="text-[#555550]">Webhook Ingest</span>
                <span className="text-[#111111] font-bold">Deno Edge Functions</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#efece6] border border-[#d4d0c7]">
                <span className="text-[#555550]">AI Engine Provider</span>
                <span className="text-[#111111] font-bold">Gemini 1.5 Flash</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#efece6] border border-[#d4d0c7]">
                <span className="text-[#555550]">Frontend Hosting</span>
                <span className="text-[#111111] font-bold">Cloudflare Pages</span>
              </div>
            </div>

            <div className="p-3 bg-[#111111] text-center">
              <span className="text-[11px] font-mono text-[#f7f5f0] uppercase font-bold tracking-wider">
                Monthly Cloud Cost: <span className="text-[#e63920]">$0.00 / mo</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Analysis Pipeline Telemetry */}
        <div className="border border-[#d4d0c7] bg-[#f7f5f0] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#d4d0c7]">
            <div className="flex items-center space-x-2.5">
              <Activity className="h-4 w-4 text-[#e63920]" />
              <h2 className="text-sm font-display font-bold uppercase tracking-wider text-[#111111]">
                Recent Ephemeral Pipeline Runs
              </h2>
            </div>
            <Link 
              to="/" 
              className="text-xs font-mono text-[#111111] hover:text-[#e63920] hover:underline flex items-center space-x-1 font-semibold"
            >
              <span>View Triage Queue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#d4d0c7]">
            {RECENT_RUNS.map((run) => (
              <div key={run.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5 text-xs font-mono">
                    <span className="font-bold text-[#e63920]">PR #{run.prNumber}</span>
                    <span className="text-[#b5b0a4]">·</span>
                    <span className="text-[#666660]">{run.id}</span>
                    <span className="text-[#b5b0a4]">·</span>
                    <span className="text-[#888880]">{run.completedAt}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#111111]">
                    {run.title}
                  </h3>
                  {run.ruleHits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {run.ruleHits.map((rule) => (
                        <span key={rule} className="text-[10px] font-mono px-2 py-0.5 bg-[#efece6] text-[#e63920] border border-[#d4d0c7] font-medium">
                          {rule}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#666660] block">DURATION</span>
                    <span className="text-xs font-mono font-semibold text-[#111111]">{run.duration}</span>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <span className="text-[10px] font-mono text-[#666660] block">RISK</span>
                    <span className={`text-base font-mono font-extrabold ${
                      run.riskScore >= 75 ? "text-[#e63920]" : run.riskScore >= 50 ? "text-[#f97316]" : "text-[#107040]"
                    }`}>
                      {run.riskScore}/100
                    </span>
                  </div>

                  <Link
                    to={`/pr/${run.prNumber}`}
                    className="px-3 py-1.5 bg-[#111111] hover:bg-[#e63920] text-xs font-mono text-white transition-all"
                  >
                    Inspect Surface →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
