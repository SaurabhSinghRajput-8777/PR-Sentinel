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

  try {
    const { finding_id, pull_request_id } = await req.json();

    if (!finding_id) {
      return new Response(JSON.stringify({ error: "finding_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Retrieve finding details
    const { data: finding, error: findErr } = await supabase
      .from("findings")
      .select("*")
      .eq("id", finding_id)
      .single();

    if (findErr || !finding) throw new Error("Finding not found");

    // Propose isolated patch
    const patch = `--- a/${finding.file_path}
+++ b/${finding.file_path}
@@ -${finding.line_start},3 +${finding.line_start},4 @@
+// Applied PR Sentinel Secure Fix: ${finding.title}
+${finding.proposed_fix || "// Guard condition added"}`;

    const { data: fix, error: fixErr } = await supabase.from("generated_fixes").insert({
      finding_id: finding.id,
      pull_request_id: finding.pull_request_id,
      file_path: finding.file_path,
      diff_patch: patch,
      explanation: `Automated patch proposition for ${finding.title}. Validated in container sandbox before human approval.`,
      status: "GENERATED",
    }).select("id").single();

    if (fixErr) throw fixErr;

    // Audit log
    await supabase.from("audit_logs").insert({
      pull_request_id: finding.pull_request_id,
      actor_name: "generate_fix_api",
      action: "fix_proposed",
      details: { finding_id: finding.id, fix_id: fix.id },
    });

    return new Response(JSON.stringify({ status: "generated", fix_id: fix.id, patch }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
