import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const githubToken = Deno.env.get("GITHUB_TOKEN"); // Token needed to post to github

  try {
    const { pull_request_id, comment_body } = await req.json();

    if (!pull_request_id) {
      return new Response(JSON.stringify({ error: "pull_request_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pr, error: prErr } = await supabase
      .from("pull_requests")
      .select("*, repositories(*)")
      .eq("id", pull_request_id)
      .single();

    if (prErr || !pr) throw new Error("PR not found");

    // Fetch top critical findings
    const { data: findings } = await supabase
      .from("findings")
      .select("*")
      .eq("pull_request_id", pr.id)
      .eq("severity", "CRITICAL")
      .limit(3);

    // Format GitHub Markdown comment
    let body = comment_body;
    if (!body) {
      const findingsList = (findings || [])
        .map((f: any) => `- **[${f.severity}]** \`${f.file_path}:${f.line_start}\` — **${f.title}**: ${f.explanation}`)
        .join("\n");

      body = `## 🛡️ PR Sentinel Review Orchestration Report\n\n**Risk Score:** **${pr.risk_score} / 100** (\`${pr.risk_level} RISK\`)\n\n${findings && findings.length > 0 ? `### ⚠️ Critical Findings Detected:\n${findingsList}` : "✅ No critical security or regression risks detected."}\n\n---\n*👉 View complete risk blast radius, evidence graph & sandbox fix validation in the **[PR Sentinel Command Center](https://pr-sentinel.pages.dev/pr/${pr.number})**.*\n*(Human-in-the-loop enforced: AI fixes require human approval before merging)*`;
    }
    
    let githubCommentId = null;
    let githubStatus = "stub_published_no_token";

    // 🚀 NEW: ACTUALLY POST TO GITHUB IF WE HAVE A TOKEN
    if (githubToken && pr.repositories?.full_name) {
      const githubRes = await fetch(`https://api.github.com/repos/${pr.repositories.full_name}/issues/${pr.number}/comments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "PR-Sentinel"
        },
        body: JSON.stringify({ body })
      });
      
      if (!githubRes.ok) {
        const errorText = await githubRes.text();
        throw new Error(`GitHub API error: ${githubRes.status} ${errorText}`);
      }
      
      const githubData = await githubRes.json();
      githubCommentId = githubData.id;
      githubStatus = "published_to_github";
    }

    // Record audit event
    await supabase.from("audit_logs").insert({
      pull_request_id: pr.id,
      actor_name: "github_comment",
      action: githubStatus,
      details: { pr_number: pr.number, risk_score: pr.risk_score, github_comment_id: githubCommentId },
    });

    return new Response(JSON.stringify({ status: githubStatus, pr_number: pr.number, comment_id: githubCommentId, body }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
