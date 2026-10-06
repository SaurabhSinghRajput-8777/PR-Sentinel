import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/dashboard-api\/?/, "");

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 0. GET /stats — Global Telemetry & Command Center overview stats
    if (req.method === "GET" && path === "stats") {
      const { count: prCount } = await supabase.from("pull_requests").select("*", { count: "exact", head: true });
      const { count: jobCount } = await supabase.from("analysis_jobs").select("*", { count: "exact", head: true });
      const { count: findingCount } = await supabase.from("findings").select("*", { count: "exact", head: true });
      const { count: fixCount } = await supabase.from("generated_fixes").select("*", { count: "exact", head: true });
      
      const { data: recentPRs } = await supabase
        .from("pull_requests")
        .select("id, number, title, state, risk_score, risk_level, created_at, head_branch, repositories(name)")
        .order("created_at", { ascending: false })
        .limit(10);

      return new Response(JSON.stringify({
        stats: {
          total_prs: prCount ?? 0,
          total_jobs: jobCount ?? 0,
          total_findings: findingCount ?? 0,
          total_fixes: fixCount ?? 0,
        },
        recent_prs: recentPRs ?? []
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. GET /prs — Queue of pull requests with risk scores
    if (req.method === "GET" && (path === "prs" || path === "")) {
      const status = url.searchParams.get("status") || "open";
      const { data, error } = await supabase
        .from("pull_requests")
        .select("*, repositories(name, owner)")
        .eq("state", status)
        .order("risk_score", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. GET /prs/:id — Detailed PR with findings, brief & recommendations
    const prMatch = path.match(/^prs\/([^\/]+)$/);
    if (req.method === "GET" && prMatch) {
      const prParam = prMatch[1];
      const isNum = /^\d+$/.test(prParam);
      
      let prQuery = supabase.from("pull_requests").select("*, repositories(*)");
      if (isNum) {
        prQuery = prQuery.eq("number", parseInt(prParam, 10));
      } else {
        prQuery = prQuery.eq("id", prParam);
      }

      const { data: pr, error: prErr } = await prQuery.single();

      if (prErr || !pr) {
        return new Response(JSON.stringify({ error: "PR not found", details: prErr?.message }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch findings
      const { data: findings } = await supabase
        .from("findings")
        .select("*")
        .eq("pull_request_id", pr.id)
        .order("severity");

      // Fetch recommendations
      const { data: reviewers } = await supabase
        .from("reviewer_recommendations")
        .select("*")
        .eq("pull_request_id", pr.id)
        .order("score", { ascending: false });

      return new Response(JSON.stringify({ pr, findings: findings || [], reviewers: reviewers || [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. POST /prs/:id/analyze — Trigger on-demand re-analysis
    const analyzeMatch = path.match(/^prs\/([^\/]+)\/analyze$/);
    if (req.method === "POST" && analyzeMatch) {
      const prParam = analyzeMatch[1];
      const isNum = /^\d+$/.test(prParam);

      let prQuery = supabase.from("pull_requests").select("id, repository_id, head_commit_sha");
      if (isNum) {
        prQuery = prQuery.eq("number", parseInt(prParam, 10));
      } else {
        prQuery = prQuery.eq("id", prParam);
      }

      const { data: pr } = await prQuery.single();

      if (!pr) {
        return new Response(JSON.stringify({ error: "PR not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Enqueue job
      const { data: job, error: jobErr } = await supabase.from("analysis_jobs").insert({
        repository_id: pr.repository_id,
        pull_request_id: pr.id,
        commit_sha: pr.head_commit_sha,
        status: "QUEUED",
        priority: 5, // Manual trigger priority boost
      }).select("id").single();

      if (jobErr) throw jobErr;

      return new Response(JSON.stringify({ status: "queued", job_id: job.id }), {
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. POST /prs/:id/findings/:finding_id/approve - Approve a patch
    const patchMatch = path.match(/^prs\/([^\/]+)\/findings\/([^\/]+)\/approve$/);
    if (req.method === "POST" && patchMatch) {
      const prParam = patchMatch[1];
      const findingId = patchMatch[2];
      
      const isNum = /^\d+$/.test(prParam);
      let prQuery = supabase.from("pull_requests").select("*, repositories(*)").single();
      if (isNum) {
        prQuery = prQuery.eq("number", parseInt(prParam, 10));
      } else {
        prQuery = prQuery.eq("id", prParam);
      }
      const { data: pr, error: prErr } = await prQuery;
      if (prErr || !pr) throw new Error("PR not found");

      const { data: finding, error: findErr } = await supabase.from("findings").select("*").eq("id", findingId).single();
      if (findErr || !finding) throw new Error("Finding not found");

      const githubToken = Deno.env.get("GITHUB_TOKEN");
      let comment_id = null;
      if (githubToken && pr.repositories?.full_name) {
        const githubRes = await fetch(`https://api.github.com/repos/${pr.repositories.full_name}/pulls/${pr.number}/comments`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${githubToken}`,
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "PR-Sentinel"
          },
          body: JSON.stringify({
            body: `**PR Sentinel Patch Suggestion**\n\n${finding.proposed_fix}\n\n*(Note: This is an AI-generated suggestion, please review before committing)*`,
            commit_id: pr.head_commit_sha,
            path: finding.file_path,
            line: finding.line_start || 1,
            side: "RIGHT"
          })
        });
        
        if (!githubRes.ok) {
           const errText = await githubRes.text();
           console.error("GitHub API Error", errText);
        } else {
           const githubData = await githubRes.json();
           comment_id = githubData.id;
        }
      }

      await supabase.from("findings").update({ validation_status: "VALIDATED" }).eq("id", findingId);

      return new Response(JSON.stringify({ status: "patch_approved", comment_id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Endpoint not found", path }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
