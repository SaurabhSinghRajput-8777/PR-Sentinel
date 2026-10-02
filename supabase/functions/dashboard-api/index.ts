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
      const prId = prMatch[1];
      const { data: pr, error: prErr } = await supabase
        .from("pull_requests")
        .select("*, repositories(*)")
        .or(`id.eq.${prId},number.eq.${isNaN(Number(prId)) ? -1 : Number(prId)}`)
        .single();

      if (prErr) throw prErr;

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

      return new Response(JSON.stringify({ pr, findings, reviewers }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. POST /prs/:id/analyze — Trigger on-demand re-analysis
    const analyzeMatch = path.match(/^prs\/([^\/]+)\/analyze$/);
    if (req.method === "POST" && analyzeMatch) {
      const prId = analyzeMatch[1];
      const { data: pr } = await supabase
        .from("pull_requests")
        .select("id, repository_id, head_commit_sha")
        .or(`id.eq.${prId},number.eq.${isNaN(Number(prId)) ? -1 : Number(prId)}`)
        .single();

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
